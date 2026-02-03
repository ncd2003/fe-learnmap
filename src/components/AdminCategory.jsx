import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryApi } from '../../api/categoryApi';
import { toast } from 'react-toastify';
import './AdminCategory.css';

function AdminCategory() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAllCategoriesPublic();
      
      if (response.statusCode === 200 && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên danh mục không được để trống';
    } else if (formData.name.length > 100) {
      errors.name = 'Tên danh mục không được quá 100 ký tự';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Mô tả không được quá 500 ký tự';
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
      if (editingCategory) {
        // Update existing category
        await categoryApi.updateCategory(editingCategory.id, formData);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        // Create new category
        await categoryApi.createCategory(formData);
        toast.success('Thêm danh mục mới thành công!');
      }
      
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) {
      return;
    }

    try {
      await categoryApi.deleteCategory(id);
      toast.success('Xóa danh mục thành công!');
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Không thể xóa danh mục. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="admin-category-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-title">Quản lý Danh mục</h1>
            <p className="admin-subtitle">Quản lý các danh mục khóa học</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-add-category">
          + Thêm danh mục mới
        </button>
      </div>

      <div className="admin-content">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <div className="stat-value">{categories.length}</div>
              <div className="stat-label">Tổng danh mục</div>
            </div>
          </div>
        </div>

        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    Chưa có danh mục nào. Hãy thêm danh mục mới!
                  </td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td className="category-name">{category.name}</td>
                    <td className="category-description">{category.description || '—'}</td>
                    <td className="category-actions">
                      <button 
                        onClick={() => handleOpenModal(category)}
                        className="btn-edit"
                        title="Chỉnh sửa"
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id, category.name)}
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

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button onClick={handleCloseModal} className="btn-close-modal">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="name">Tên danh mục *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Lập trình, Marketing, ..."
                  className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả về danh mục này..."
                  rows="4"
                  className={formErrors.description ? 'input-error' : ''}
                />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-cancel">
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategory;
