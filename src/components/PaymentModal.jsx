import { useState, useEffect } from 'react';
import './PaymentModal.css';

function PaymentModal({ plan, onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    if (paymentMethod === 'momo' || paymentMethod === 'banking') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 120;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentMethod]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const handlePayment = async () => {
    // Prevent double-click
    if (processing) {
      return;
    }
    
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    }, 2000);
  };

  const generateQRCode = () => {
    const amount = plan.price;
    const planName = plan.name;
    
    let paymentInfo = '';
    if (paymentMethod === 'momo') {
      paymentInfo = `MoMo Payment|Amount: ${amount} VND|Plan: ${planName}|Demo Transaction`;
    } else if (paymentMethod === 'banking') {
      paymentInfo = `Bank Transfer|Amount: ${amount} VND|Plan: ${planName}|Account: 1234567890|Demo Transaction`;
    }
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentInfo)}`;
  };

  if (success) {
    return (
      <div className="payment-modal-overlay" onClick={onClose}>
        <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
          <div className="payment-success">
            <div className="success-icon">
              <span>✓</span>
            </div>
            <h3>Thanh toán thành công!</h3>
            <p>Bạn đã đăng ký gói {plan.name} thành công.</p>
            <p style={{ marginTop: '12px', fontSize: '14px' }}>
              Tự động đóng sau 2 giây...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="payment-modal-overlay">
        <div className="payment-modal">
          <div className="payment-processing">
            <div className="spinner"></div>
            <p>Đang xử lý thanh toán...</p>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#9ca3af' }}>
              Vui lòng không đóng cửa sổ này
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>💳 Thanh toán</h2>
          <button className="btn-close-payment" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-modal-body">
          {/* Payment Summary */}
          <div className="payment-summary">
            <h3>Thông tin gói đăng ký</h3>
            <div className="plan-name">
              <span>{getPlanIcon(plan.code)}</span>
              {plan.name}
            </div>
            <div className="plan-details">
              <div className="detail-row">
                <span>Thời hạn:</span>
                <span>{plan.durationInDays} ngày</span>
              </div>
              <div className="detail-row">
                <span>Giá gói:</span>
                <span>{formatPrice(plan.price)}</span>
              </div>
              <div className="detail-row total-row">
                <span>Tổng thanh toán:</span>
                <span>{formatPrice(plan.price)}</span>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="payment-demo-notice">
            <span>ℹ️</span>
            <p>
              <strong>Đây là trang thanh toán demo.</strong> Quét mã QR hoặc nhấn "Đã thanh toán" 
              để mô phỏng thanh toán thành công.
            </p>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <h3>Phương thức thanh toán</h3>
            <div className="payment-method-options">
              <label className={`payment-method-option ${paymentMethod === 'momo' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment-method"
                  value="momo"
                  checked={paymentMethod === 'momo'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-method-info">
                  <div className="method-name">Ví MoMo</div>
                  <div className="method-desc">Quét mã QR để thanh toán</div>
                </div>
                <div className="payment-method-icon">📱</div>
              </label>

              {/* <label className={`payment-method-option ${paymentMethod === 'banking' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment-method"
                  value="banking"
                  checked={paymentMethod === 'banking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-method-info">
                  <div className="method-name">Chuyển khoản ngân hàng</div>
                  <div className="method-desc">Quét mã QR ngân hàng</div>
                </div>
                <div className="payment-method-icon">🏦</div>
              </label>
 */}
              {/* <label className={`payment-method-option ${paymentMethod === 'credit-card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment-method"
                  value="credit-card"
                  checked={paymentMethod === 'credit-card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-method-info">
                  <div className="method-name">Thẻ tín dụng/Thẻ ghi nợ</div>
                  <div className="method-desc">Visa, Mastercard, JCB</div>
                </div>
                <div className="payment-method-icon">💳</div>
              </label> */}
            </div>
          </div>

          {/* QR Code Display for MoMo and Banking */}
          {(paymentMethod === 'momo' || paymentMethod === 'banking') && (
            <div className="qr-code-section">
              <div className="qr-code-header">
                <h3>{paymentMethod === 'momo' ? '📱 Quét mã QR MoMo' : '🏦 Quét mã QR Ngân hàng'}</h3>
                <div className="qr-countdown">
                  <span>⏱️ Hết hạn sau: <strong>{formatTime(countdown)}</strong></span>
                </div>
              </div>
              
              <div className="qr-code-container">
                <img 
                  src={generateQRCode()} 
                  alt="QR Code" 
                  className="qr-code-image"
                />
              </div>

              <div className="payment-info">
                <div className="info-row">
                  <span className="info-label">Số tiền:</span>
                  <span className="info-value">{formatPrice(plan.price)}</span>
                </div>
                {paymentMethod === 'banking' && (
                  <>
                    <div className="info-row">
                      <span className="info-label">Ngân hàng:</span>
                      <span className="info-value">MB Bank (Demo)</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Số tài khoản:</span>
                      <span className="info-value">1234567890</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Chủ tài khoản:</span>
                      <span className="info-value">LEARNMAP PLATFORM</span>
                    </div>
                  </>
                )}
                <div className="info-row">
                  <span className="info-label">Nội dung:</span>
                  <span className="info-value">THANHTOAN {plan.code}</span>
                </div>
              </div>

              <div className="qr-instructions">
                <p><strong>Hướng dẫn thanh toán:</strong></p>
                <ol>
                  <li>Mở ứng dụng {paymentMethod === 'momo' ? 'MoMo' : 'Banking'}</li>
                  <li>Chọn "Quét mã QR"</li>
                  <li>Quét mã QR bên trên</li>
                  <li>Xác nhận thanh toán</li>
                  <li>Nhấn "Đã thanh toán" bên dưới</li>
                </ol>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="payment-actions">
            <button 
              className="btn-payment btn-payment-cancel" 
              onClick={onClose}
              disabled={processing}
            >
              Hủy
            </button>
            <button 
              className="btn-payment btn-payment-submit"
              onClick={handlePayment}
              disabled={processing}
            >
              {(paymentMethod === 'momo' || paymentMethod === 'banking') ? 'Đã thanh toán' : 'Xác nhận thanh toán'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
