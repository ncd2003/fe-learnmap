import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planApi } from '../../api/planApi';
import { planFeatureApi } from '../../api/planFeatureApi';
import { toast } from 'react-toastify';
import './AdminPlan.css';

function AdminPlan() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    durationInDays: '',
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Available features for selection
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const [loadingAvailableFeatures, setLoadingAvailableFeatures] = useState(false);
  
  // Plan Feature states
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planFeatures, setPlanFeatures] = useState([]);
  const [showPlanFeaturesModal, setShowPlanFeaturesModal] = useState(false);
  
  // All features and selected features for comparison
  const [allFeatures, setAllFeatures] = useState([]);
  const [loadingAllFeatures, setLoadingAllFeatures] = useState(false);
  const [selectedPlanFeatureIds, setSelectedPlanFeatureIds] = useState([]);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planApi.getAllPlans();
      if (response.statusCode === 200 && response.data) {
        setPlans(Array.isArray(response.data) ? response.data : []);
      } else {
        setPlans([]);
      }
    } catch (error) {
      setPlans([]);
      toast.error('Không thể tải danh sách plan', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      price: '',
      durationInDays: '',
    });
    setFormErrors({});
    setSelectedFeatureIds([]);
    setShowModal(true);
    
    // Fetch available features
    try {
      setLoadingAvailableFeatures(true);
      const response = await planFeatureApi.getAllPlanFeatures();
      if (response.statusCode === 200 && response.data) {
        setAvailableFeatures(Array.isArray(response.data) ? response.data : []);
      } else {
        setAvailableFeatures([]);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      setAvailableFeatures([]);
    } finally {
      setLoadingAvailableFeatures(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      code: '',
      name: '',
      description: '',
      price: '',
      durationInDays: '',
    });
    setFormErrors({});
    setSelectedFeatureIds([]);
    setAvailableFeatures([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.code?.trim()) {
      errors.code = 'Mã plan không được để trống';
    }
    
    if (!formData.name?.trim()) {
      errors.name = 'Tên plan không được để trống';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Giá phải lớn hơn 0';
    }
    
    if (!formData.durationInDays || formData.durationInDays <= 0) {
      errors.durationInDays = 'Số ngày phải lớn hơn 0';
    }
    
    if (selectedFeatureIds.length === 0) {
      errors.features = 'Vui lòng chọn ít nhất 1 tính năng';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        durationInDays: parseInt(formData.durationInDays),
        planFeatureIds: selectedFeatureIds,
      };
      
      await planApi.createPlan(submitData);
      toast.success('Tạo plan thành công!');
      handleCloseModal();
      fetchPlans();
    } catch (error) {
      // Toast đã được xử lý bởi AuthorBaseApi interceptor
      console.error('Error creating plan:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPlanCodeBadge = (code) => {
    const badges = {
      'FREE': { text: '🆓 FREE', className: 'plan-free' },
      'STANDARD': { text: '⭐ STANDARD', className: 'plan-standard' },
      'PREMIUM': { text: '💎 PREMIUM', className: 'plan-premium' },
    };
    return badges[code] || { text: code, className: 'plan-default' };
  };

  // Plan Feature functions
  const handlePlanClick = async (plan) => {
    setSelectedPlan(plan);
    setShowPlanFeaturesModal(true);
    // Lấy features từ plan data
    setPlanFeatures(plan.features || []);
    // Khởi tạo selected features với các feature hiện tại của plan
    const currentFeatureIds = (plan.features || []).map(f => f.id);
    setSelectedPlanFeatureIds(currentFeatureIds);
    // Load tất cả features có sẵn
    await fetchAllFeatures();
  };

  const fetchAllFeatures = async () => {
    try {
      setLoadingAllFeatures(true);
      const response = await planFeatureApi.getAllFeatures();
      if (response.statusCode === 200 && response.data) {
        setAllFeatures(Array.isArray(response.data) ? response.data : []);
      } else {
        setAllFeatures([]);
      }
    } catch (error) {
      setAllFeatures([]);
      toast.error('Không thể tải danh sách tính năng', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingAllFeatures(false);
    }
  };

  const handleClosePlanFeaturesModal = () => {
    setShowPlanFeaturesModal(false);
    setSelectedPlan(null);
    setPlanFeatures([]);
    setAllFeatures([]);
    setSelectedPlanFeatureIds([]);
  };

  const handleUpdatePlanFeatures = async () => {
    try {
      setIsUpdatingPlan(true);
      const updateData = {
        code: selectedPlan.code,
        name: selectedPlan.name,
        description: selectedPlan.description,
        price: selectedPlan.price,
        durationInDays: selectedPlan.durationInDays,
        planFeatureIds: selectedPlanFeatureIds,
      };
      
      await planApi.updatePlan(selectedPlan.id, updateData);
      toast.success('Cập nhật tính năng thành công!');
      
      // Reload plans để cập nhật dữ liệu mới
      await fetchPlans();
      
      // Cập nhật selectedPlan với plan mới
      const updatedPlans = await planApi.getAllPlans();
      if (updatedPlans.statusCode === 200 && updatedPlans.data) {
        const updatedPlan = updatedPlans.data.find(p => p.id === selectedPlan.id);
        if (updatedPlan) {
          setSelectedPlan(updatedPlan);
          setPlanFeatures(updatedPlan.features || []);
          setSelectedPlanFeatureIds((updatedPlan.features || []).map(f => f.id));
        }
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setIsUpdatingPlan(false);
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
    <div className="admin-plan-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h2 className="admin-title">Quản lý Plan</h2>
            <p className="admin-subtitle">Quản lý các gói dịch vụ</p>
          </div>
        </div>
        <button className="btn-add-plan" onClick={handleOpenModal}>
          + Thêm Gói Mới
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{plans.length}</div>
            <div className="stat-label">Tổng số Plan</div>
          </div>
        </div>
      </div>

      <div className="plans-table-container">
        <table className="plans-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã gói</th>
              <th>Tên gói</th>
              <th>Mô tả</th>
              <th>Giá</th>
              <th>Thời hạn (ngày)</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">📦</span>
                    <p>Chưa có gói nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.id}</td>
                  <td>
                    <span className={`plan-badge ${getPlanCodeBadge(plan.code).className}`}>
                      {getPlanCodeBadge(plan.code).text}
                    </span>
                  </td>
                  <td className="plan-name">{plan.name}</td>
                  <td className="plan-description">
                    {plan.description || <span className="text-muted">Chưa có mô tả</span>}
                  </td>
                  <td className="plan-price">{formatPrice(plan.price)}</td>
                  <td className="plan-duration">{plan.durationInDays} ngày</td>
                  <td>
                    <button 
                      className="btn-view-features" 
                      onClick={() => handlePlanClick(plan)}
                    >
                      Tính năng gói
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal hiển thị plan features */}
      {showPlanFeaturesModal && selectedPlan && (
        <div className="modal-overlay" onClick={handleClosePlanFeaturesModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Tính năng của {selectedPlan.name}</h3>
                <span className={`plan-badge ${getPlanCodeBadge(selectedPlan.code).className}`}>
                  {getPlanCodeBadge(selectedPlan.code).text}
                </span>
              </div>
              <button className="btn-close" onClick={handleClosePlanFeaturesModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="plan-info-row">
                <div className="plan-info-item">
                  <span className="info-label">💰 Giá:</span>
                  <span className="info-value">{formatPrice(selectedPlan.price)}</span>
                </div>
                <div className="plan-info-item">
                  <span className="info-label">📅 Thời hạn:</span>
                  <span className="info-value">{selectedPlan.durationInDays} ngày</span>
                </div>
                <div className="plan-info-item">
                  <span className="info-label">🎯 Số tính năng:</span>
                  <span className="info-value">{planFeatures.length}</span>
                </div>
              </div>

              <div className="features-section">
                <div className="features-header">
                  <h4>Danh sách tính năng</h4>
                </div>

                {loadingAllFeatures ? (
                  <div className="features-loading">
                    <div className="spinner"></div>
                    <p>Đang tải tính năng...</p>
                  </div>
                ) : (
                  <div className="features-list">
                    {allFeatures.length === 0 ? (
                      <div className="no-features">
                        <span className="no-features-icon">📦</span>
                        <p>Không có tính năng nào</p>
                      </div>
                    ) : (
                      <table className="features-table">
                        <thead>
                          <tr>
                            <th style={{ width: '50px' }}>✓</th>
                            <th>ID</th>
                            <th>Mã tính năng</th>
                            <th>Mô tả</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allFeatures.map((feature) => {
                            // Kiểm tra xem feature này có trong plan không
                            const isInPlan = selectedPlanFeatureIds.includes(feature.id);
                            // Lấy description từ planFeatures nếu có, nếu không thì từ allFeatures
                            const planFeature = planFeatures.find(pf => pf.id === feature.id);
                            const description = planFeature?.description || feature.description;
                            
                            return (
                              <tr key={feature.id} className={isInPlan ? 'feature-enabled' : ''}>
                                <td className="feature-checkbox">
                                  <input 
                                    type="checkbox" 
                                    checked={isInPlan}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedPlanFeatureIds([...selectedPlanFeatureIds, feature.id]);
                                      } else {
                                        setSelectedPlanFeatureIds(selectedPlanFeatureIds.filter(id => id !== feature.id));
                                      }
                                    }}
                                  />
                                </td>
                                <td>{feature.id}</td>
                                <td className="feature-key">
                                  {feature.featureKey || <span className="text-muted">Chưa có</span>}
                                </td>
                                <td className="feature-description">
                                  {description || <span className="text-muted">Chưa có mô tả</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-actions" style={{ marginTop: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '15px' }}>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleClosePlanFeaturesModal}
              >
                Đóng
              </button>
              <button 
                type="button" 
                className="btn-submit" 
                onClick={handleUpdatePlanFeatures}
                disabled={isUpdatingPlan}
              >
                {isUpdatingPlan ? 'Cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm plan */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Gói Mới</h3>
              <button className="btn-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="code">
                  Mã Gói <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Ví dụ: FREE, STANDARD, PREMIUM"
                  className={formErrors.code ? 'error' : ''}
                />
                {formErrors.code && <span className="error-message">{formErrors.code}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="name">
                  Tên Gói <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên Gói"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả gói"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">
                  Giá (VNĐ) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Nhập giá"
                  min="0"
                  step="1000"
                  className={formErrors.price ? 'error' : ''}
                />
                {formErrors.price && <span className="error-message">{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="durationInDays">
                  Thời hạn (ngày) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="durationInDays"
                  name="durationInDays"
                  value={formData.durationInDays}
                  onChange={handleChange}
                  placeholder="Nhập số ngày"
                  min="1"
                  className={formErrors.durationInDays ? 'error' : ''}
                />
                {formErrors.durationInDays && <span className="error-message">{formErrors.durationInDays}</span>}
              </div>

              <div className="form-group">
                <label>
                  Chọn tính năng <span className="required">*</span>
                </label>
                {loadingAvailableFeatures ? (
                  <div className="features-loading-inline">
                    <div className="spinner-small"></div>
                    <span>Đang tải tính năng...</span>
                  </div>
                ) : (
                  <div className="features-checkbox-list">
                    {availableFeatures.length === 0 ? (
                      <p className="no-features-msg">Không có tính năng nào</p>
                    ) : (
                      availableFeatures.map((feature) => (
                        <label key={feature.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={selectedFeatureIds.includes(feature.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFeatureIds([...selectedFeatureIds, feature.id]);
                              } else {
                                setSelectedFeatureIds(selectedFeatureIds.filter(id => id !== feature.id));
                              }
                            }}
                          />
                          <span className="checkbox-label">{feature.featureKey}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
                {formErrors.features && <span className="error-message">{formErrors.features}</span>}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Tạo Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPlan;
