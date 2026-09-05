import math
import json
import struct

def build_heart_glb(output_filepath):
    nodes = []
    meshes = []
    accessors = []
    buffer_views = []
    bin_data = bytearray()

    def add_buffer_data(data_bytes, target=None):
        offset = len(bin_data)
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
        pos_bytes = bytearray()
        min_p = [float('inf')] * 3
        max_p = [float('-inf')] * 3
        for p in positions:
            for c in range(3):
                min_p[c] = min(min_p[c], p[c])
                max_p[c] = max(max_p[c], p[c])
            pos_bytes.extend(struct.pack('<fff', p[0], p[1], p[2]))

        pos_bv = add_buffer_data(pos_bytes, target=34962)
        pos_acc = len(accessors)
        accessors.append({
            "bufferView": pos_bv,
            "byteOffset": 0,
            "componentType": 5126,
            "count": len(positions),
            "type": "VEC3",
            "min": min_p,
            "max": max_p
        })

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

        idx_bytes = bytearray()
        max_idx = max(indices) if indices else 0
        use_uint32 = max_idx > 65535
        component_type = 5125 if use_uint32 else 5123

        for idx in indices:
            if use_uint32:
                idx_bytes.extend(struct.pack('<I', idx))
            else:
                idx_bytes.extend(struct.pack('<H', idx))

        idx_bv = add_buffer_data(idx_bytes, target=34963)
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

    # =========================================================================
    # ORGANIC ANATOMICAL HEART GEOMETRY GENERATORS (6-VIEW MATCHING)
    # =========================================================================

    # 1. Outer Pericardium Shell (Unified Asymmetric Heart Cone)
    def generate_pericardium():
        stacks, slices = 72, 96
        positions = []
        indices = []

        for i in range(stacks + 1):
            phi = i * math.pi / stacks
            v_norm = phi / math.pi

            for j in range(slices + 1):
                theta = j * 2.0 * math.pi / slices - math.pi

                radius = 1.25
                base_bulge = math.sin(phi * 0.88)
                radius *= (0.30 + 0.80 * base_bulge)

                if 0.15 < theta < 1.95:
                    radius += 0.20 * math.sin((theta - 0.15) / 1.8 * math.pi)
                elif theta >= 1.95 or theta < -2.3:
                    radius += 0.16 * (1.0 - 0.35 * v_norm)
                else:
                    radius -= 0.15 * math.sin(abs(theta) * 0.85)

                # Anterior Interventricular Sulcus (LAD Groove)
                sulcus_theta = 0.92 - 0.38 * v_norm
                dist_sulcus = abs(theta - sulcus_theta)
                if dist_sulcus < 0.42 and 0.22 < v_norm < 0.92:
                    radius -= 0.18 * math.cos((dist_sulcus / 0.42) * (math.pi / 2))

                # AV Sulcus Waist
                av_dist = abs(phi - 0.38 * math.pi)
                if av_dist < 0.30:
                    radius -= 0.14 * math.cos((av_dist / 0.30) * (math.pi / 2))

                # Infundibulum / Conus Arteriosus
                if abs(theta - 0.62) < 0.42 and 0.18 < v_norm < 0.44:
                    radius += 0.15 * math.cos((abs(theta - 0.62) / 0.42) * (math.pi / 2))

                rx = radius * math.sin(phi) * math.cos(theta)
                ry = radius * math.cos(phi)
                rz = radius * math.sin(phi) * math.sin(theta)

                apex_displace = math.pow(v_norm, 1.82)
                x = rx * 1.06 - 0.42 * apex_displace
                y = 1.06 - 2.30 * v_norm
                z = rz * 0.96 + 0.32 * apex_displace

                positions.append([x, y, z])

        for i in range(stacks):
            for j in range(slices):
                p1 = i * (slices + 1) + j
                p2 = p1 + (slices + 1)
                indices.extend([p1, p2, p1 + 1])
                indices.extend([p2, p2 + 1, p1 + 1])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # 2. Left Ventricle (Thick-walled muscular cone forming sharp apex, no flat caps)
    def generate_left_ventricle():
        stacks, slices = 60, 64
        positions = []
        indices = []

        for i in range(stacks + 1):
            phi = i * math.pi / stacks # 0 (base) to pi (apex)
            v_norm = phi / math.pi
            
            # Muscular tapering radius along sphere-based profile
            radius_x = 0.58 * math.sin(phi * 0.92)
            radius_z = 0.52 * math.sin(phi * 0.92)

            apex_shift_x = -0.18 * math.pow(v_norm, 1.6)
            apex_shift_z = 0.14 * math.pow(v_norm, 1.6)

            y = 0.55 - 1.65 * v_norm

            for j in range(slices + 1):
                theta = j * 2.0 * math.pi / slices
                x = radius_x * math.cos(theta) - 0.32 + apex_shift_x
                z = radius_z * math.sin(theta) + 0.16 + apex_shift_z
                positions.append([x, y, z])

        for i in range(stacks):
            for j in range(slices):
                p1 = i * (slices + 1) + j
                p2 = p1 + (slices + 1)
                indices.extend([p1, p2, p1 + 1])
                indices.extend([p2, p2 + 1, p1 + 1])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # 3. Right Ventricle (Crescentic anterior pouch wrapping LV & Septum)
    def generate_right_ventricle():
        stacks, slices = 60, 64
        positions = []
        indices = []

        for i in range(stacks + 1):
            phi = i * math.pi / stacks
            v_norm = phi / math.pi

            radius_x = 0.65 * math.sin(phi * 0.88)
            radius_z = 0.38 * math.sin(phi * 0.88)
            crescent_curve = 0.32 * math.sin(v_norm * math.pi)

            # Infundibulum outflow funnel leading up into pulmonary valve
            inf_x = -0.22 * math.pow(1.0 - v_norm, 2.0) if v_norm < 0.4 else 0.0
            inf_z = 0.16 * math.pow(1.0 - v_norm, 2.0) if v_norm < 0.4 else 0.0

            y = 0.52 - 1.45 * v_norm

            for j in range(slices + 1):
                theta = j * 2.0 * math.pi / slices
                x = radius_x * math.cos(theta) + 0.34 + inf_x
                z = radius_z * math.sin(theta) + crescent_curve + 0.36 + inf_z
                positions.append([x, y, z])

        for i in range(stacks):
            for j in range(slices):
                p1 = i * (slices + 1) + j
                p2 = p1 + (slices + 1)
                indices.extend([p1, p2, p1 + 1])
                indices.extend([p2, p2 + 1, p1 + 1])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # 4. Interventricular Septum
    def generate_septum():
        stacks, slices = 36, 32
        positions = []
        indices = []

        for i in range(stacks + 1):
            t = i / stacks
            y = 0.45 - 1.40 * t
            for j in range(slices + 1):
                theta = (j / slices - 0.5) * math.pi * 0.90
                x = 0.28 * math.sin(theta) + 0.02
                z = 0.14 * math.cos(theta) + 0.20
                positions.append([x, y, z])

        for i in range(stacks):
            for j in range(slices):
                p1 = i * (slices + 1) + j
                p2 = (i + 1) * (slices + 1) + j
                indices.extend([p1, p2, p1 + 1])
                indices.extend([p2, p2 + 1, p1 + 1])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # 5 & 6. Atria (Left & Right Atria with Auricle flaps)
    def generate_atrium(cx, cy, cz, rx, ry, rz, is_left=False):
        stacks, slices = 44, 48
        positions = []
        indices = []

        for i in range(stacks + 1):
            phi = i * math.pi / stacks
            for j in range(slices + 1):
                theta = j * 2.0 * math.pi / slices
                x = cx + rx * math.sin(phi) * math.cos(theta)
                y = cy + ry * math.cos(phi)
                z = cz + rz * math.sin(phi) * math.sin(theta)

                # Auricular flap sculpting
                if is_left:
                    if theta < 1.2 and phi < 1.8:
                        z += 0.16 * math.sin(phi) * math.cos(theta * 0.8)
                else:
                    if 0.4 < theta < 2.2 and phi < 1.8:
                        x -= 0.18 * math.sin(phi) * math.sin((theta - 0.4) / 1.8 * math.pi)
                        z += 0.12 * math.sin(phi)

                positions.append([x, y, z])

        for i in range(stacks):
            for j in range(slices):
                p1 = i * (slices + 1) + j
                p2 = p1 + (slices + 1)
                indices.extend([p1, p2, p1 + 1])
                indices.extend([p2, p2 + 1, p1 + 1])

        normals = compute_normals(positions, indices)
        return positions, normals, indices

    # 7. Smooth Flared Spline Tube Generator for Great Vessels
    def generate_tube(points, radius, segments=48, radial_segments=24, flare_root=False):
        positions = []
        indices = []
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
            t = i / segments

            if i < segments:
                tang = [curve_pts[i+1][c] - pt[c] for c in range(3)]
            else:
                tang = [pt[c] - curve_pts[i-1][c] for c in range(3)]

            t_len = math.sqrt(sum(c*c for c in tang)) or 1.0
            tang = [c / t_len for c in tang]

            up = [0, 1, 0] if abs(tang[1]) < 0.9 else [1, 0, 0]
            nx = [tang[1]*up[2] - tang[2]*up[1], tang[2]*up[0] - tang[0]*up[2], tang[0]*up[1] - tang[1]*up[0]]
            n_len = math.sqrt(sum(c*c for c in nx)) or 1.0
            nx = [c / n_len for c in nx]
            ny = [tang[1]*nx[2] - tang[2]*nx[1], tang[2]*nx[0] - tang[0]*nx[2], tang[0]*nx[1] - tang[1]*nx[0]]

            r = radius * (1.0 - 0.12 * t)
            if flare_root:
                r += radius * 0.48 * math.exp(-5.0 * t) # Flared ostium root

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

    # Combine multiple tube geometries into one mesh
    def merge_mesh_data(mesh_list):
        all_pos = []
        all_norm = []
        all_idx = []
        offset = 0

        for pos, norm, idx in mesh_list:
            all_pos.extend(pos)
            all_norm.extend(norm)
            for id_val in idx:
                all_idx.append(id_val + offset)
            offset += len(pos)

        return all_pos, all_norm, all_idx

    # =========================================================================
    # BUILD ALL 11 ANATOMICAL HEART STRUCTURES
    # =========================================================================

    root_children = []

    # 1. Pericardium Outer Shell
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

    # 5. Left Atrium & Auricle + 4 Pulmonary Veins
    la_body = generate_atrium(-0.28, 0.68, -0.38, 0.58, 0.50, 0.52, is_left=True)
    pv1 = generate_tube([[-0.55, 0.82, -0.45], [-0.78, 0.86, -0.52], [-0.98, 0.90, -0.60]], 0.08, 16, 14, flare_root=True)
    pv2 = generate_tube([[-0.55, 0.58, -0.48], [-0.76, 0.58, -0.55], [-0.95, 0.58, -0.65]], 0.08, 16, 14, flare_root=True)
    pv3 = generate_tube([[-0.02, 0.82, -0.50], [0.18, 0.85, -0.58], [0.38, 0.88, -0.68]], 0.08, 16, 14, flare_root=True)
    pv4 = generate_tube([[-0.02, 0.58, -0.52], [0.16, 0.58, -0.60], [0.35, 0.58, -0.70]], 0.08, 16, 14, flare_root=True)
    la_merged = merge_mesh_data([la_body, pv1, pv2, pv3, pv4])
    root_children.append(create_mesh_node("left_atrium", la_merged[0], la_merged[1], la_merged[2]))

    # 6. Right Atrium & Auricle
    ra_body = generate_atrium(0.76, 0.52, 0.06, 0.58, 0.72, 0.55, is_left=False)
    root_children.append(create_mesh_node("right_atrium", ra_body[0], ra_body[1], ra_body[2]))

    # 7. Ascending Aorta, Arch & 3 Supra-Aortic Branches
    aorta_trunk = generate_tube([
        [0.00, 0.35, 0.10], [0.08, 1.12, 0.14], [-0.16, 1.76, 0.06],
        [-0.54, 1.58, -0.28], [-0.70, 0.82, -0.46], [-0.74, -0.38, -0.48]
    ], 0.23, 48, 20, flare_root=True)
    brachio = generate_tube([[0.00, 1.68, 0.08], [0.10, 1.98, 0.07], [0.18, 2.28, 0.06]], 0.082, 16, 14, flare_root=True)
    carotid = generate_tube([[-0.20, 1.74, 0.02], [-0.19, 2.02, 0.00], [-0.18, 2.30, -0.02]], 0.072, 16, 14, flare_root=True)
    subclav = generate_tube([[-0.38, 1.70, -0.10], [-0.41, 1.98, -0.14], [-0.45, 2.26, -0.18]], 0.072, 16, 14, flare_root=True)
    aorta_merged = merge_mesh_data([aorta_trunk, brachio, carotid, subclav])
    root_children.append(create_mesh_node("aorta", aorta_merged[0], aorta_merged[1], aorta_merged[2]))

    # 8. Pulmonary Artery Trunk & Left/Right Branches (Crossing in FRONT of Aorta)
    pa_trunk = generate_tube([[0.24, 0.38, 0.36], [0.14, 0.92, 0.28], [-0.14, 1.30, 0.08]], 0.21, 32, 18, flare_root=True)
    left_pa = generate_tube([[-0.14, 1.30, 0.08], [-0.52, 1.26, -0.12], [-0.85, 1.22, -0.26]], 0.13, 20, 14, flare_root=True)
    right_pa = generate_tube([[-0.14, 1.30, 0.08], [0.32, 1.24, -0.06], [0.80, 1.18, -0.18]], 0.13, 20, 14, flare_root=True)
    pa_merged = merge_mesh_data([pa_trunk, left_pa, right_pa])
    root_children.append(create_mesh_node("pulmonary_artery", pa_merged[0], pa_merged[1], pa_merged[2]))

    # 9. Superior Vena Cava & Inferior Vena Cava
    svc_tube = generate_tube([[0.82, 0.85, 0.02], [0.82, 1.44, -0.02], [0.82, 1.98, -0.04]], 0.18, 24, 16, flare_root=True)
    ivc_tube = generate_tube([[0.76, 0.20, 0.02], [0.76, -0.34, 0.01], [0.76, -0.78, 0.00]], 0.17, 20, 16, flare_root=True)
    vc_merged = merge_mesh_data([svc_tube, ivc_tube])
    root_children.append(create_mesh_node("superior_vena_cava", vc_merged[0], vc_merged[1], vc_merged[2]))

    # 10. Cardiac Valves (Mitral, Tricuspid, Aortic, Pulmonary Annuli)
    valve_tube1 = generate_tube([[-0.24, 0.30, -0.12], [-0.22, 0.28, -0.10]], 0.28, 12, 16)
    valve_tube2 = generate_tube([[0.32, 0.22, 0.22], [0.30, 0.20, 0.20]], 0.30, 12, 16)
    valve_tube3 = generate_tube([[0.00, 0.40, 0.12], [0.02, 0.38, 0.10]], 0.22, 12, 16)
    valve_tube4 = generate_tube([[0.20, 0.52, 0.32], [0.18, 0.50, 0.30]], 0.20, 12, 16)
    valves_merged = merge_mesh_data([valve_tube1, valve_tube2, valve_tube3, valve_tube4])
    root_children.append(create_mesh_node("valves", valves_merged[0], valves_merged[1], valves_merged[2]))

    # 11. Coronary Arteries (LAD, LCx, RCA, Diagonals, Marginals)
    lad = generate_tube([[-0.06, 0.48, 0.24], [0.04, 0.22, 0.38], [-0.02, -0.12, 0.38], [-0.16, -0.52, 0.32], [-0.32, -0.80, 0.24]], 0.040, 36, 12)
    diag = generate_tube([[0.02, 0.05, 0.38], [-0.22, -0.15, 0.35], [-0.45, -0.38, 0.26]], 0.028, 18, 10)
    lcx = generate_tube([[-0.06, 0.48, 0.24], [-0.35, 0.38, 0.15], [-0.52, 0.28, -0.10], [-0.48, 0.05, -0.28]], 0.033, 22, 10)
    rca = generate_tube([[0.12, 0.48, 0.20], [0.45, 0.30, 0.30], [0.68, 0.08, 0.24], [0.64, -0.22, 0.14], [0.35, -0.52, -0.04]], 0.040, 34, 12)
    marg = generate_tube([[0.66, -0.05, 0.20], [0.55, -0.25, 0.28], [0.28, -0.50, 0.26]], 0.028, 18, 10)
    coronary_merged = merge_mesh_data([lad, diag, lcx, rca, marg])
    root_children.append(create_mesh_node("coronary_arteries", coronary_merged[0], coronary_merged[1], coronary_merged[2]))

    # Root Node
    root_node_idx = len(nodes)
    nodes.append({
        "name": "AnatomicalHeartPivot",
        "children": root_children
    })

    gltf = {
        "asset": {"version": "2.0", "generator": "NeuroScope Organic Heart GLB Exporter"},
        "scenes": [{"nodes": [root_node_idx]}],
        "scene": 0,
        "nodes": nodes,
        "meshes": meshes,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(bin_data)}]
    }

    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    json_pad = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * json_pad

    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    header = struct.pack('<4sII', b'glTF', 2, total_length)
    chunk0_header = struct.pack('<I4s', len(json_bytes), b'JSON')
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
