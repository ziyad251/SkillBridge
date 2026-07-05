import axiosInstance from "@/api/axiosInstance";

export async function registerService(formData) {
  const { data } = await axiosInstance.post("/auth/register", {
    ...formData,
    role: "user",
  });

  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", formData);

  return data;
}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");

  return data;
}

export async function fetchProfileService() {
  const { data } = await axiosInstance.get("/auth/profile");

  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function mediaDeleteService(id) {
  const { data } = await axiosInstance.delete(`/media/delete/${id}`);

  return data;
}

export async function fetchInstructorCourseListService(instructorId) {
  const query = instructorId ? `?instructorId=${instructorId}` : "";
  const { data } = await axiosInstance.get(`/instructor/course/get${query}`);

  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/instructor/course/get/details/${id}`
  );

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );

  return data;
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function fetchStudentViewCourseListService(query) {
  const { data } = await axiosInstance.get(`/student/course/get?${query}`);

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/course/get/details/${courseId}`
  );

  return data;
}

export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const { data } = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );

  return data;
}

export async function createRazorpayOrderService(formData) {
  const { data } = await axiosInstance.post(`/api/payment/create-order`, formData);

  return data;
}

export async function verifyRazorpayPaymentService(formData) {
  const { data } = await axiosInstance.post(`/api/payment/verify`, formData);

  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );

  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}

// Review Services
export async function createReviewService(courseId, rating, review) {
  const { data } = await axiosInstance.post(`/api/reviews/create`, {
    courseId,
    rating,
    review,
  });

  return data;
}

export async function getReviewsByCourseService(courseId) {
  const { data } = await axiosInstance.get(`/api/reviews/course/${courseId}`);

  return data;
}

export async function updateReviewService(reviewId, rating, review) {
  const { data } = await axiosInstance.put(`/api/reviews/update/${reviewId}`, {
    rating,
    review,
  });

  return data;
}

export async function deleteReviewService(reviewId) {
  const { data } = await axiosInstance.delete(
    `/api/reviews/delete/${reviewId}`
  );

  return data;
}

// Certificate Services
export async function downloadCertificateService(courseId) {
  const response = await axiosInstance.get(`/api/certificate/${courseId}`, {
    responseType: "blob",
  });

  // Create blob and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `certificate-${courseId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentElement.removeChild(link);
  window.URL.revokeObjectURL(url);

  return { success: true };
}
