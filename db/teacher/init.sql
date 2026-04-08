-- ============================================================
--  TEACHER_DB — Teacher Service
--  Courses, resources, roadmap templates, student progress
--  Auto-executed on first PostgreSQL container start
-- ============================================================

-- Courses: created and managed by teachers
-- teacher_id   -> cross-service ref to auth_db.users  (NO FK)
-- teacher_name -> denormalized copy, updated via UserUpdated event
CREATE TABLE IF NOT EXISTS courses (
    course_id    TEXT PRIMARY KEY,
    teacher_id   UUID        NOT NULL,
    teacher_name TEXT        NOT NULL DEFAULT '',
    title        TEXT        NOT NULL,
    description  TEXT        NOT NULL DEFAULT '',
    status       TEXT        NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','active','archived')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- Course resources: uploaded files (stored in MinIO)
CREATE TABLE IF NOT EXISTS course_resources (
    resource_id  TEXT PRIMARY KEY,
    course_id    TEXT        NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    unit_id      TEXT        REFERENCES course_units(unit_id) ON DELETE SET NULL,
    title        TEXT        NOT NULL,
    file_type    TEXT        NOT NULL CHECK (file_type IN ('pdf','video','doc','pptx')),
    minio_uri    TEXT        NOT NULL,
    size_bytes   BIGINT      NOT NULL DEFAULT 0,
    uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roadmap templates: teacher-designed learning paths (cloned on student enroll)


-- Template nodes: graph nodes within a roadmap template

-- Template edges: directed connections between template nodes


-- Student progress: aggregated per-course progress
-- student_id   -> cross-service ref to auth_db.users  (NO FK)
-- student_name -> denormalized copy, updated via UserUpdated event


-- ============================================================
--  Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_courses_teacher           ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status            ON courses(status);
CREATE INDEX IF NOT EXISTS idx_course_units_course       ON course_units(course_id);
CREATE INDEX IF NOT EXISTS idx_course_units_order        ON course_units(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_resources_course          ON course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_unit            ON course_resources(unit_id);
CREATE INDEX IF NOT EXISTS idx_templates_course          ON roadmap_templates(course_id);
CREATE INDEX IF NOT EXISTS idx_template_nodes_template   ON template_nodes(template_id);
CREATE INDEX IF NOT EXISTS idx_template_edges_template   ON template_edges(template_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_course   ON student_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student  ON student_progress(student_id);
