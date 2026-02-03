import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { categoryApi } from '../../api/categoryApi';
import { uploadApi } from '../../api/uploadApi';
import CourseBuilder from './CourseBuilder';
import { toast } from 'react-toastify';
import './AdminCourse.css';

function AdminCourse() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    thumbnailUrl: '',
    published: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, categoriesResponse] = await Promise.all([
        courseApi.getAllCourses(),
        categoryApi.getAllCategoriesPublic(),
      ]);
      
      if (coursesResponse.statusCode === 200 && coursesResponse.data) {
        const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
        console.log('Fetched courses:', coursesData);
        setCourses(coursesData);
      } else {
        setCourses([]);
      }
      
      if (categoriesResponse.statusCode === 200 && categoriesResponse.data) {
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setCourses([]);
      setCategories([]);
      // Toast đã được xử lý tự động bởi AuthorBaseApi interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      // Safely extract categoryId from course.category
      let categoryId = '';
      if (course.category) {
        if (typeof course.category === 'object' && course.category.id) {
          categoryId = course.category.id;
        } else if (typeof course.category === 'number') {
          categoryId = course.category;
        }
      }
      
      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || '',
        categoryId: categoryId,
        thumbnailUrl: course.thumbnailUrl || '',
        published: course.published !== undefined ? course.published : true,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        thumbnailUrl: '',
        published: true,
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      categoryId: '',
      thumbnailUrl: '',
      published: true,
    });
    setFormErrors({});
    setThumbnailFile(null);
    setUploading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      setThumbnailFile(file);
      // Preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        thumbnailUrl: previewUrl
      }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Tên khóa học không được để trống';
    }

    if (!formData.description.trim()) {
      errors.description = 'Mô tả không được để trống';
    }

    if (!formData.price || formData.price < 0) {
      errors.price = 'Giá phải là số dương';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Vui lòng chọn danh mục';
    }

    if (formData.published === null || formData.published === undefined) {
      errors.published = 'Vui lòng chọn trạng thái xuất bản';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let thumbnailUrl = formData.thumbnailUrl || null;
      
      // Upload thumbnail if file is selected
      if (thumbnailFile) {
        setUploading(true);
        try {
          thumbnailUrl = await uploadApi.uploadImage(thumbnailFile);
        } catch (uploadError) {
          toast.error('Upload ảnh thất bại: ' + uploadError.message, {
            position: "top-right",
            autoClose: 3000,
          });
          setUploading(false);
          return;
        }
        setUploading(false);
      }
      
      const courseData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        published: formData.published,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        thumbnailUrl: thumbnailUrl,
      };

      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, courseData);
        toast.success('Cập nhật khóa học thành công!');
      } else {
        await courseApi.createCourse(courseData);
        toast.success('Thêm khóa học mới thành công!');
      }
      
      handleCloseModal();
      fetchData();
    } catch (error) {
      // Toast đã được xử lý tự động bởi AuthorBaseApi interceptor
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}"?`)) {
      return;
    }

    try {
      await courseApi.deleteCourse(id);
      toast.success('Xóa khóa học thành công!');
      fetchData();
    } catch (error) {
      // Toast đã được xử lý tự động bởi AuthorBaseApi interceptor
      console.error('Error deleting course:', error);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getCategoryName = (course) => {
    if (!course.category) return '—';
    // If category is an object with name property
    if (typeof course.category === 'object' && course.category.name) {
      return course.category.name;
    }
    // If category is a string, return it directly (backend now returns category name as string)
    if (typeof course.category === 'string') {
      // If it looks like a Java object (contains @), try to find in categories list
      if (course.category.includes('@') && course.categoryId) {
        const cat = categories.find(c => c.id === course.categoryId);
        return cat ? cat.name : '—';
      }
      // Otherwise it's the category name
      return course.category;
    }
    return '—';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  // Redirect to CourseBuilder if a course is selected
  if (selectedCourseId) {
    navigate(`/dashboard/course-builder?courseId=${selectedCourseId}`);
    return null;
  }

  return (
    <div className="admin-course-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-title">Quản lý Khóa học</h1>
            <p className="admin-subtitle">Quản lý các khóa học trên hệ thống</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-add-course">
          + Thêm khóa học mới
        </button>
      </div>

      <div className="admin-content">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-info">
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Tổng khóa học</div>
            </div>
          </div>
        </div>

        <div className="courses-table-container">
          <table className="courses-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên khóa học</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Chưa có khóa học nào. Hãy thêm khóa học mới!
                  </td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td className="course-title">
                      <div className="title-cell">
                        {course.thumbnailUrl && (
                          <img src={course.thumbnailUrl} alt={course.title} className="course-thumb" />
                        )}
                        <span>{course.title}</span>
                      </div>
                    </td>
                    <td>{getCategoryName(course)}</td>
                    <td className="course-price">{formatPrice(course.price)}</td>
                    <td>
                      <span className={`status-badge ${course.published ? 'true' : 'false'}`}>
                        {course.published ? '🌐 Công khai' : '🔒 Riêng tư'}
                      </span>
                    </td>
                    <td className="course-actions">
                      <button 
                        onClick={() => setSelectedCourseId(course.id)}
                        className="btn-build"
                        title="Xây dựng nội dung"
                      >
                        🏗️ Nội dung
                      </button>
                      <button 
                        onClick={() => handleOpenModal(course)}
                        className="btn-edit"
                        title="Chỉnh sửa"
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id, course.title)}
                        className="btn-delete"
                        title="Xóa"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Course */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</h2>
              <button onClick={handleCloseModal} className="btn-close-modal">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Tên khóa học *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ví dụ: Khóa học lập trình Web..."
                    className={formErrors.title ? 'input-error' : ''}
                  />
                  {formErrors.title && <span className="error-text">{formErrors.title}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="categoryId">Danh mục *</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={formErrors.categoryId ? 'input-error' : ''}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.categoryId && <span className="error-text">{formErrors.categoryId}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả về khóa học..."
                  rows="4"
                  className={formErrors.description ? 'input-error' : ''}
                />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className={formErrors.price ? 'input-error' : ''}
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="published">Trạng thái *</label>
                  <select
                    id="published"
                    name="published"
                    value={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.value === 'true' }))}
                    className={formErrors.published ? 'input-error' : ''}
                  >
                    <option value="true">🌐 Công khai</option>
                    <option value="false">🔒 Riêng tư</option>
                  </select>
                  {formErrors.published && <span className="error-text">{formErrors.published}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="thumbnailFile">Ảnh thumbnail</label>
                <input
                  type="file"
                  id="thumbnailFile"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                {formData.thumbnailUrl && (
                  <div className="thumbnail-preview">
                    <img src={formData.thumbnailUrl} alt="Thumbnail preview" />
                  </div>
                )}
                <small style={{color: '#999', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                  Chọn ảnh để upload lên S3
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel" disabled={uploading}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? 'Đang upload...' : (editingCourse ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCourse;
