CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  instructor_id VARCHAR(64) NOT NULL,
  instructor_name TEXT,
  course_date TIMESTAMPTZ,
  title TEXT NOT NULL,
  category TEXT,
  level TEXT,
  primary_language TEXT,
  subtitle TEXT,
  description TEXT,
  image TEXT,
  welcome_message TEXT,
  pricing NUMERIC(12, 2),
  objectives TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT courses_instructor_fk FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lectures (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  video_url TEXT,
  public_id TEXT,
  free_preview BOOLEAN NOT NULL DEFAULT FALSE,
  is_legacy BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT lectures_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT lectures_course_position_unique UNIQUE (course_id, position)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  title TEXT,
  instructor_id VARCHAR(64),
  instructor_name TEXT,
  date_of_purchase TIMESTAMPTZ,
  course_image TEXT,
  paid_amount NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enrollments_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT enrollments_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS course_students (
  course_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  student_name TEXT,
  student_email TEXT,
  paid_amount NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, student_id),
  CONSTRAINT course_students_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT course_students_user_fk FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_name TEXT,
  user_email TEXT,
  order_status TEXT,
  payment_method TEXT,
  payment_status TEXT,
  order_date TIMESTAMPTZ,
  payment_id TEXT,
  payer_id TEXT,
  instructor_id VARCHAR(64),
  instructor_name TEXT,
  course_image TEXT,
  course_title TEXT,
  course_id VARCHAR(64),
  course_pricing NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT orders_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT orders_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS course_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_date TIMESTAMPTZ,
  CONSTRAINT progress_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT progress_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT progress_user_course_unique UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lecture_progress (
  progress_id BIGINT NOT NULL,
  lecture_id VARCHAR(64) NOT NULL,
  viewed BOOLEAN NOT NULL DEFAULT FALSE,
  date_viewed TIMESTAMPTZ,
  PRIMARY KEY (progress_id, lecture_id),
  CONSTRAINT lecture_progress_progress_fk FOREIGN KEY (progress_id) REFERENCES course_progress(id) ON DELETE CASCADE,
  CONSTRAINT lecture_progress_lecture_fk FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reviews_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT reviews_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT reviews_course_user_unique UNIQUE (course_id, user_id)
);

CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  certificate_id TEXT NOT NULL UNIQUE,
  completion_date TIMESTAMPTZ NOT NULL,
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT certificates_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT certificates_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT certificates_course_user_unique UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS courses_instructor_idx ON courses (instructor_id);
CREATE INDEX IF NOT EXISTS courses_category_idx ON courses (category);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_payment_idx ON orders (payment_id);
CREATE INDEX IF NOT EXISTS reviews_course_created_idx ON reviews (course_id, created_at DESC);

ALTER TABLE lectures ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN NOT NULL DEFAULT FALSE;