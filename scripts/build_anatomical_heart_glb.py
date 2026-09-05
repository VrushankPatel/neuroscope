import math
import json
import struct

def build_heart_glb(output_filepath):
    # Data structures for GLTF export
    nodes = []
    meshes = []
    accessors = []
    buffer_views = []
    bin_data = bytearray()

    def add_buffer_data(data_bytes, target=None):
        offset = len(bin_data)
        # Pad to 4-byte boundary
        pad = (4 - (offset % 4)) % 4
        bin_data.extend(b'\x00' * pad)
        offset = len(bin_data)

        bin_data.extend(data_bytes)
        length = len(data_bytes)

        bv_idx = len(buffer_views)
        bv_dict = {
            "buffer": 0,
            "byteOffset": offset,
            "byteLength": length
        }
        if target:
            bv_dict["target"] = target
        buffer_views.append(bv_dict)
        return bv_idx

    def create_mesh_node(name, positions, normals, indices):
        # Position buffer: Float32 [N, 3]
        pos_bytes = bytearray()
        min_p = [float('inf')] * 3
        max_p = [float('-inf')] * 3
        for p in positions:
            for c in range(3):
                min_p[c] = min(min_p[c], p[c])
                max_p[c] = max(max_p[c], p[c])
            pos_bytes.extend(struct.pack('<fff', p[0], p[1], p[2]))

        pos_bv = add_buffer_data(pos_bytes, target=34962) # ARRAY_BUFFER
        pos_acc = len(accessors)
        accessors.append({
            "bufferView": pos_bv,
            "byteOffset": 0,
            "componentType": 5126, # FLOAT
            "count": len(positions),
            "type": "VEC3",
            "min": min_p,
            "max": max_p
        })

        # Normal buffer: Float32 [N, 3]
        norm_bytes = bytearray()
        for n in normals:
            norm_bytes.extend(struct.pack('<fff', n[0], n[1], n[2]))
        norm_bv = add_buffer_data(norm_bytes, target=34962)
        norm_acc = len(accessors)
        accessors.append({
            "bufferView": norm_bv,
            "byteOffset": 0,
            "componentType": 5126,
            "count": len(normals),
            "type": "VEC3"
        })

        # Index buffer: Uint16 or Uint32 [M]
        idx_bytes = bytearray()
        max_idx = max(indices) if indices else 0
        use_uint32 = max_idx > 65535
        component_type = 5125 if use_uint32 else 5123 # UNSIGNED_INT vs UNSIGNED_SHORT

        for idx in indices:
            if use_uint32:
                idx_bytes.extend(struct.pack('<I', idx))
            else:
                idx_bytes.extend(struct.pack('<H', idx))

        idx_bv = add_buffer_data(idx_bytes, target=34963) # ELEMENT_ARRAY_BUFFER
        idx_acc = len(accessors)
        accessors.append({
            "bufferView": idx_bv,
            "byteOffset": 0,
            "componentType": component_type,
            "count": len(indices),
            "type": "SCALAR"
        })

        mesh_idx = len(meshes)
        meshes.append({
            "name": name,
            "primitives": [{
                "attributes": {
                    "POSITION": pos_acc,
                    "NORMAL": norm_acc
                },
                "indices": idx_acc
            }]
        })

        node_idx = len(nodes)
        nodes.append({
            "name": name,
            "mesh": mesh_idx
        })

        return node_idx

    # =========================================================================
    # HELPER GEOMETRY GENERATORS WITH ANATOMICAL SCULPTING
    # =========================================================================

    def compute_normals(positions, indices):
        normals = [[0.0, 0.0, 0.0] for _ in range(len(positions))]
        for i in range(0, len(indices), 3):
            i0, i1, i2 = indices[i], indices[i+1], indices[i+2]
            p0, p1, p2 = positions[i0], positions[i1], positions[i2]

            u = [p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]]
            v = [p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]]

            nx = u[1]*v[2] - u[2]*v[1]
            ny = u[2]*v[0] - u[0]*v[2]
            nz = u[0]*v[1] - u[1]*v[0]

            for idx in (i0, i1, i2):
                normals[idx][0] += nx
                normals[idx][1] += ny
                normals[idx][2] += nz

        for i in range(len(normals)):
            nx, ny, nz = normals[i]
            length = math.sqrt(nx*nx + ny*ny + nz*nz) or 1.0
            normals[i] = [nx/length, ny/length, nz/length]

        return normals

    # --- 1. Pericardium Shell (Anatomical epicardial surface contour) ---
    def generate_pericardium():
        stacks, slices = 72, 96
        positions = []
        indices = []

        for i in range(stacks + 1):
            phi = i * math.pi / stacks
            v_norm = phi / math.pi

            for j in range(slices + 1):
                theta = j * 2.0 * math.pi / slices - math.pi

                radius = 1.22
                base_bulge = math.sin(phi * 0.88)
                radius *= (0.32 + 0.78 * base_bulge)

                if 0.15 < theta < 1.95:
                    radius += 0.18 * math.sin((theta - 0.15) / 1.8 * math.pi)
                elif theta >= 1.95 or theta < -2.3:
                    radius += 0.15 * (1.0 - 0.35 * v_norm)
                else:
                    radius -= 0.14 * math.sin(abs(theta) * 0.85)

                # LAD groove
                sulcus_theta = 0.92 - 0.38 * v_norm
                dist_sulcus = abs(theta - sulcus_theta)
                if dist_sulcus < 0.42 and 0.22 < v_norm < 0.92:
                    radius -= 0.16 * math.cos((dist_sulcus / 0.42) * (math.pi / 2))

                # AV sulcus
                av_dist = abs(phi - 0.38 * math.pi)
                if av_dist < 0.30:
                    radius -= 0.13 * math.cos((av_dist / 0.30) * (math.pi / 2))

                # Infundibulum bulge
                if abs(theta - 0.62) < 0.42 and 0.18 < v_norm < 0.44:
                    radius += 0.14 * math.cos((abs(theta - 0.62) / 0.42) * (math.pi / 2))

                radius += 0.02 * math.sin(theta * 3.0) * math.cos(phi * 4.0)

                rx = radius * math.sin(phi) * math.cos(theta)
                ry = radius * math.cos(phi)
                rz = radius * math.sin(phi) * math.sin(theta)

                apex_displace = math.pow(v_norm, 1.82)
                x = rx * 1.06 - 0.40 * apex_displace
                y = 1.06 - 2.28 * v_norm
                z = rz * 0.96 + 0.30 * apex_displace

                positions.append([x, y, z])

        for i in range(stacks):
            for j in range(slices):
                p1 = i * (slices + 1) + j
                p2 = p1 + (slices + 1)
                indices.extend([p1, p2, p1 + 1])
                indices.extend([p2, p2 + 1, p1 + 1])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # --- 2. Left Ventricle (Muscular elongated cone forming apex) ---
    def generate_left_ventricle():
        stacks, slices = 44, 48
        positions = []
        indices = []

        for i in range(stacks + 1):
            t = i / stacks # 0 (apex) to 1 (base)
            y = (t - 0.5) * 1.50 - 0.34

            # Muscular tapering cross section
            rad_x = (0.36 + 0.64 * math.sin(t * math.pi * 0.90)) * 0.60
            rad_z = (0.34 + 0.66 * math.sin(t * math.pi * 0.90)) * 0.52

            apex_shift_x = 0.0
            apex_shift_z = 0.0
            if t < 0.36:
                apex_shift_x = -0.15 * math.pow(1.0 - t / 0.36, 1.5)
                apex_shift_z = 0.11 * math.pow(1.0 - t / 0.36, 1.5)

            for j in range(slices):
                theta = j * 2.0 * math.pi / slices
                x = rad_x * math.cos(theta) - 0.34 + apex_shift_x
                z = rad_z * math.sin(theta) + 0.18 + apex_shift_z

                # Apply thoracic cardiac tilt
                cos_z, sin_z = math.cos(0.24), math.sin(0.24)
                nx = x * cos_z - y * sin_z
                ny = x * sin_z + y * cos_z
                positions.append([nx, ny, z])

        for i in range(stacks):
            for j in range(slices):
                j_next = (j + 1) % slices
                p1 = i * slices + j
                p2 = (i + 1) * slices + j
                p3 = (i + 1) * slices + j_next
                p4 = i * slices + j_next
                indices.extend([p1, p2, p4])
                indices.extend([p4, p2, p3])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # --- 3. Right Ventricle (Crescent anterior pocket wrapped around septum) ---
    def generate_right_ventricle():
        stacks, slices = 44, 48
        positions = []
        indices = []

        for i in range(stacks + 1):
            t = i / stacks
            y = (t - 0.5) * 1.20 - 0.20

            rad_x = (0.60 + 0.40 * t) * 0.64
            crescent_curve = 0.29 * math.sin(t * math.pi)

            inf_x, inf_z = 0.0, 0.0
            if t > 0.66:
                inf_factor = (t - 0.66) / 0.34
                inf_x = -0.19 * inf_factor
                inf_z = 0.13 * inf_factor

            for j in range(slices):
                theta = j * 2.0 * math.pi / slices
                x = rad_x * math.cos(theta) + 0.36 + inf_x
                z = rad_x * math.sin(theta) * 0.55 + crescent_curve + 0.38 + inf_z

                cos_z, sin_z = math.cos(-0.18), math.sin(-0.18)
                nx = x * cos_z - y * sin_z
                ny = x * sin_z + y * cos_z
                positions.append([nx, ny, z])

        for i in range(stacks):
            for j in range(slices):
                j_next = (j + 1) % slices
                p1 = i * slices + j
                p2 = (i + 1) * slices + j
                p3 = (i + 1) * slices + j_next
                p4 = i * slices + j_next
                indices.extend([p1, p2, p4])
                indices.extend([p4, p2, p3])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # --- 4. Interventricular Septum ---
    def generate_septum():
        stacks, slices = 28, 24
        positions = []
        indices = []

        for i in range(stacks + 1):
            t = i / stacks
            y = (t - 0.5) * 1.24 - 0.30
            for j in range(slices + 1):
                theta = (j / slices - 0.5) * math.pi * 0.88
                x = 0.50 * math.sin(theta) * 0.50 + 0.04
                z = 0.28 * math.cos(theta) * 0.35 + 0.18 + 0.06
                positions.append([x, y, z])

        for i in range(stacks):
            for j in range(slices):
                p1 = i * (slices + 1) + j
                p2 = (i + 1) * (slices + 1) + j
                indices.extend([p1, p2, p1 + 1])
                indices.extend([p2, p2 + 1, p1 + 1])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # --- 5 & 6. Atria & Appendages ---
    def generate_atrium(cx, cy, cz, rx, ry, rz, name):
        stacks, slices = 36, 40
        positions = []
        indices = []

        for i in range(stacks + 1):
            phi = i * math.pi / stacks
            for j in range(slices + 1):
                theta = j * 2.0 * math.pi / slices
                x = cx + rx * math.sin(phi) * math.cos(theta)
                y = cy + ry * math.cos(phi)
                z = cz + rz * math.sin(phi) * math.sin(theta)

                # Add auricular flap
                if name == "left_atrium" and theta < 0.5 and phi < 1.5:
                    z += 0.12 * math.cos(phi)
                elif name == "right_atrium" and 0.5 < theta < 2.0 and phi < 1.5:
                    x -= 0.14 * math.sin(theta)

                positions.append([x, y, z])

        for i in range(stacks):
            for j in range(slices):
                p1 = i * (slices + 1) + j
                p2 = p1 + (slices + 1)
                indices.extend([p1, p2, p1 + 1])
                indices.extend([p2, p2 + 1, p1 + 1])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # --- 7, 8, 9. Tube Geometries for Great Vessels ---
    def generate_tube(points, radius, segments=36, radial_segments=16):
        # Generate smooth Catmull-Rom tube along 3D points
        positions = []
        indices = []

        # Simple interpolator along control points
        n_pts = len(points)
        curve_pts = []
        for i in range(segments + 1):
            t = i / segments
            idx = t * (n_pts - 1)
            i0 = int(idx)
            i1 = min(i0 + 1, n_pts - 1)
            frac = idx - i0

            p0, p1 = points[i0], points[i1]
            x = p0[0] * (1 - frac) + p1[0] * frac
            y = p0[1] * (1 - frac) + p1[1] * frac
            z = p0[2] * (1 - frac) + p1[2] * frac
            curve_pts.append([x, y, z])

        for i in range(segments + 1):
            pt = curve_pts[i]
            # Tangent direction
            if i < segments:
                tang = [curve_pts[i+1][c] - pt[c] for c in range(3)]
            else:
                tang = [pt[c] - curve_pts[i-1][c] for c in range(3)]

            t_len = math.sqrt(sum(c*c for c in tang)) or 1.0
            tang = [c / t_len for c in tang]

            # Normal/Binormal
            up = [0, 1, 0] if abs(tang[1]) < 0.9 else [1, 0, 0]
            nx = [tang[1]*up[2] - tang[2]*up[1], tang[2]*up[0] - tang[0]*up[2], tang[0]*up[1] - tang[1]*up[0]]
            n_len = math.sqrt(sum(c*c for c in nx)) or 1.0
            nx = [c / n_len for c in nx]

            ny = [tang[1]*nx[2] - tang[2]*nx[1], tang[2]*nx[0] - tang[0]*nx[2], tang[0]*nx[1] - tang[1]*nx[0]]

            # Tapering radius towards end
            r = radius * (1.0 - 0.15 * (i / segments))

            for j in range(radial_segments):
                angle = j * 2.0 * math.pi / radial_segments
                cos_a, sin_a = math.cos(angle), math.sin(angle)

                px = pt[0] + r * (cos_a * nx[0] + sin_a * ny[0])
                py = pt[1] + r * (cos_a * nx[1] + sin_a * ny[1])
                pz = pt[2] + r * (cos_a * nx[2] + sin_a * ny[2])
                positions.append([px, py, pz])

        for i in range(segments):
            for j in range(radial_segments):
                j_next = (j + 1) % radial_segments
                p1 = i * radial_segments + j
                p2 = (i + 1) * radial_segments + j
                p3 = (i + 1) * radial_segments + j_next
                p4 = i * radial_segments + j_next
                indices.extend([p1, p2, p4])
                indices.extend([p4, p2, p3])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # =========================================================================
    # BUILD ALL 11 ANATOMICAL HEART MESHES
    # =========================================================================

    root_children = []

    # 1. Pericardium
    pos, norm, idx = generate_pericardium()
    root_children.append(create_mesh_node("pericardium", pos, norm, idx))

    # 2. Left Ventricle
    pos, norm, idx = generate_left_ventricle()
    root_children.append(create_mesh_node("left_ventricle", pos, norm, idx))

    # 3. Right Ventricle
    pos, norm, idx = generate_right_ventricle()
    root_children.append(create_mesh_node("right_ventricle", pos, norm, idx))

    # 4. Interventricular Septum
    pos, norm, idx = generate_septum()
    root_children.append(create_mesh_node("septum", pos, norm, idx))

    # 5. Left Atrium
    pos, norm, idx = generate_atrium(-0.28, 0.68, -0.38, 0.62, 0.50, 0.53, "left_atrium")
    root_children.append(create_mesh_node("left_atrium", pos, norm, idx))

    # 6. Right Atrium
    pos, norm, idx = generate_atrium(0.76, 0.52, 0.06, 0.58, 0.72, 0.55, "right_atrium")
    root_children.append(create_mesh_node("right_atrium", pos, norm, idx))

    # 7. Aorta & Aortic Arch
    aorta_pts = [
        [0.00, 0.35, 0.10], [0.08, 1.12, 0.14], [-0.16, 1.76, 0.06],
        [-0.54, 1.58, -0.28], [-0.70, 0.82, -0.46], [-0.74, -0.38, -0.48]
    ]
    pos, norm, idx = generate_tube(aorta_pts, 0.23, segments=48, radial_segments=20)
    root_children.append(create_mesh_node("aorta", pos, norm, idx))

    # 8. Pulmonary Artery
    pa_pts = [
        [0.24, 0.38, 0.36], [0.14, 0.92, 0.28], [-0.14, 1.30, 0.08]
    ]
    pos, norm, idx = generate_tube(pa_pts, 0.21, segments=32, radial_segments=18)
    root_children.append(create_mesh_node("pulmonary_artery", pos, norm, idx))

    # 9. Superior Vena Cava
    svc_pts = [
        [0.82, 0.85, 0.02], [0.82, 1.44, -0.02], [0.82, 1.98, -0.04]
    ]
    pos, norm, idx = generate_tube(svc_pts, 0.18, segments=24, radial_segments=16)
    root_children.append(create_mesh_node("superior_vena_cava", pos, norm, idx))

    # 10. Cardiac Valves
    valve_pts = [
        [-0.24, 0.30, -0.12], [0.32, 0.22, 0.22], [0.00, 0.40, 0.12], [0.20, 0.52, 0.32]
    ]
    pos, norm, idx = generate_tube(valve_pts, 0.12, segments=16, radial_segments=12)
    root_children.append(create_mesh_node("valves", pos, norm, idx))

    # 11. Coronary Arteries
    coronary_pts = [
      [-0.06, 0.48, 0.24], [0.04, 0.22, 0.38], [-0.02, -0.12, 0.38], [-0.16, -0.52, 0.32], [-0.32, -0.80, 0.24]
    ]
    pos, norm, idx = generate_tube(coronary_pts, 0.04, segments=28, radial_segments=10)
    root_children.append(create_mesh_node("coronary_arteries", pos, norm, idx))

    # Create root scene node
    root_node_idx = len(nodes)
    nodes.append({
        "name": "AnatomicalHeartPivot",
        "children": root_children
    })

    # GLTF JSON Structure
    gltf = {
        "asset": {"version": "2.0", "generator": "NeuroScope Python GLB Exporter"},
        "scenes": [{"nodes": [root_node_idx]}],
        "scene": 0,
        "nodes": nodes,
        "meshes": meshes,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(bin_data)}]
    }

    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    # Pad JSON to 4-byte boundary
    json_pad = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * json_pad

    # GLB Header: Magic (4B), Version (4B), Total Length (4B)
    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    header = struct.pack('<4sII', b'glTF', 2, total_length)

    # Chunk 0: JSON
    chunk0_header = struct.pack('<I4s', len(json_bytes), b'JSON')

    # Chunk 1: BIN
    chunk1_header = struct.pack('<I4s', len(bin_data), b'BIN\x00')

    with open(output_filepath, 'wb') as f:
        f.write(header)
        f.write(chunk0_header)
        f.write(json_bytes)
        f.write(chunk1_header)
        f.write(bin_data)

    print(f"GLB asset generated successfully: {output_filepath} ({total_length} bytes)")

if __name__ == '__main__':
    build_heart_glb('/Users/vrushankpatel/Desktop/WORKSPACE/HumanBrain/public/anatomical_heart.glb')
