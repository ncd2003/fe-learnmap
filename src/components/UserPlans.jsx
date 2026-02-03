import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planApi } from '../../api/planApi';
import { subscriptionApi } from '../../api/subscriptionApi';
import { toast } from 'react-toastify';
import PaymentModal from './PaymentModal';
import './UserPlans.css';

function UserPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planApi.getAllPublicPlans();
      if (response.statusCode === 200 && response.data) {
        const plansData = Array.isArray(response.data) ? response.data : [];
        setPlans(plansData);
      } else {
        setPlans([]);
      }
    } catch (error) {
      setPlans([]);
      toast.error('Không thể tải danh sách gói', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPlanIcon = (code) => {
    const icons = {
      'FREE': '🆓',
      'STANDARD': '⭐',
      'PREMIUM': '💎',
    };
    return icons[code] || '📦';
  };

  const getPlanColor = (code) => {
    const colors = {
      'FREE': 'plan-card-free',
      'STANDARD': 'plan-card-standard',
      'PREMIUM': 'plan-card-premium',
    };
    return colors[code] || 'plan-card-default';
  };

  const handleSelectPlan = (plan) => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Vui lòng đăng nhập để đăng ký gói', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Open payment modal
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    // Prevent duplicate calls
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Get user info from localStorage
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      // Get accountId - try different possible keys
      const accountId = user.id || user.accountId || user.userId;
      
      // Validate data
      if (!accountId || !selectedPlan.id) {
        console.error('Missing data:', { accountId, planId: selectedPlan.id });
        toast.error('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.', {
          position: "top-right",
          autoClose: 3000,
        });
        setShowPaymentModal(false);
        setIsProcessing(false);
        return;
      }
      
      // Create subscription - ensure both are numbers
      const subscriptionData = {
        accountId: Number(accountId),
        planId: Number(selectedPlan.id),
      };

      const response = await subscriptionApi.createSubscription(subscriptionData);
      
      toast.success(`Đăng ký gói ${selectedPlan.name} thành công! Vui lòng đăng nhập lại.`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Close modal
      setShowPaymentModal(false);
      setSelectedPlan(null);
      
      // Xóa hết data user trong localStorage
      localStorage.clear();
      
      // Chuyển hướng về login
      navigate('/login');
    } catch (error) {
      console.error('Subscription error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message?.[0] || error.message?.[0] || error.error || 'Không thể đăng ký gói';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
      setShowPaymentModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePaymentModal = () => {
    if (!isProcessing) {
      setShowPaymentModal(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="user-plans-page">
        <div className="plans-loading">
          <div className="spinner"></div>
          <p>Đang tải các gói...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-plans-page">
      <div className="plans-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Quay lại
        </button>
        <div className="plans-header-content">
          <h1 className="plans-title">Chọn Gói Phù Hợp Với Bạn</h1>
          <p className="plans-subtitle">
            Nâng cấp trải nghiệm học tập của bạn với các gói dịch vụ đa dạng
          </p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="no-plans">
          <span className="no-plans-icon">📦</span>
          <h3>Chưa có gói nào</h3>
          <p>Hiện tại chưa có gói dịch vụ nào. Vui lòng quay lại sau!</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`plan-card ${getPlanColor(plan.code)}`}>
              <div className="plan-card-header">
                <div className="plan-icon">{getPlanIcon(plan.code)}</div>
                <h2 className="plan-name">{plan.name}</h2>
                <p className="plan-code">{plan.code}</p>
              </div>

              <div className="plan-price-section">
                <div className="plan-price">{formatPrice(plan.price)}</div>
                <div className="plan-duration">/{plan.durationInDays} ngày</div>
              </div>

              {plan.description && (
                <div className="plan-features">
                  <h4 className="features-title">Tính năng:</h4>
                  <p className="plan-description" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                    {plan.description}
                  </p>
                </div>
              )}

              <button 
                className="btn-select-plan"
                onClick={() => handleSelectPlan(plan)}
              >
                Chọn Gói Này
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default UserPlans;
