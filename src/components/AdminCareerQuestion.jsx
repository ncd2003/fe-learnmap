import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerQuestionApi } from '../../api/careerQuestionApi';
import { toast } from 'react-toastify';
import './AdminCareerQuestion.css';

function AdminCareerQuestion() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newQuestions, setNewQuestions] = useState([
    { content: '', careerType: 'I' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const careerTypes = [
    { value: 'R', label: 'Thực tế (Realistic)', description: 'Làm việc với máy móc, thiết bị' },
    { value: 'I', label: 'Nghiên cứu (Investigative)', description: 'Phân tích, nghiên cứu' },
    { value: 'A', label: 'Nghệ thuật (Artistic)', description: 'Sáng tạo, nghệ thuật' },
    { value: 'S', label: 'Xã hội (Social)', description: 'Hỗ trợ, làm việc với người' },
    { value: 'E', label: 'Doanh nghiệp (Enterprising)', description: 'Lãnh đạo, kinh doanh' },
    { value: 'C', label: 'Công việc văn phòng (Conventional)', description: 'Quy trình, quản lý dữ liệu' },
  ];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await careerQuestionApi.getAllCareerQuestions();
      if (response.statusCode === 200 && response.data) {
        setQuestions(Array.isArray(response.data) ? response.data : []);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      toast.error('Không thể tải danh sách câu hỏi', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setNewQuestions([{ content: '', careerType: 'I' }]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewQuestions([{ content: '', careerType: 'I' }]);
  };

  const handleAddQuestion = () => {
    setNewQuestions([...newQuestions, { content: '', careerType: 'I' }]);
  };

  const handleRemoveQuestion = (index) => {
    if (newQuestions.length > 1) {
      setNewQuestions(newQuestions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...newQuestions];
    updated[index][field] = value;
    setNewQuestions(updated);
  };

  const validateQuestions = () => {
    for (let i = 0; i < newQuestions.length; i++) {
      if (!newQuestions[i].content.trim()) {
        toast.error(`Câu hỏi ${i + 1} không được để trống`, {
          position: "top-right",
          autoClose: 3000,
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateQuestions()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await careerQuestionApi.createCareerQuestions(newQuestions);
      toast.success(`Đã tạo ${newQuestions.length} câu hỏi thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      handleCloseModal();
      fetchQuestions();
    } catch (error) {
      console.error('Error creating questions:', error);
      toast.error('Có lỗi xảy ra khi tạo câu hỏi', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCareerTypeLabel = (type) => {
    const careerType = careerTypes.find(ct => ct.value === type);
    return careerType ? careerType.label : type;
  };

  const getCareerTypeColor = (type) => {
    const colors = {
      'R': '#4CAF50',
      'I': '#2196F3',
      'A': '#9C27B0',
      'S': '#FF9800',
      'E': '#F44336',
      'C': '#795548',
    };
    return colors[type] || '#757575';
  };

  const groupQuestionsByType = () => {
    const grouped = {};
    questions.forEach(q => {
      if (!grouped[q.careerType]) {
        grouped[q.careerType] = [];
      }
      grouped[q.careerType].push(q);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  const groupedQuestions = groupQuestionsByType();

  return (
    <div className="admin-career-question-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h2 className="admin-title">Quản lý Câu hỏi Hướng nghiệp</h2>
            <p className="admin-subtitle">Tạo và quản lý các câu hỏi cho bài test hướng nghiệp</p>
          </div>
        </div>
        <button className="btn-add-question" onClick={handleOpenModal}>
          + Thêm Câu hỏi
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{questions.length}</div>
            <div className="stat-label">Tổng số câu hỏi</div>
          </div>
        </div>
        {careerTypes.map(type => (
          <div key={type.value} className="stat-card">
            <div className="stat-icon" style={{ background: getCareerTypeColor(type.value) }}>
              {type.value}
            </div>
            <div className="stat-info">
              <div className="stat-value">{groupedQuestions[type.value]?.length || 0}</div>
              <div className="stat-label">{type.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="questions-sections">
        {careerTypes.map(type => {
          const typeQuestions = groupedQuestions[type.value] || [];
          if (typeQuestions.length === 0) return null;

          return (
            <div key={type.value} className="type-section">
              <div className="type-header" style={{ borderLeftColor: getCareerTypeColor(type.value) }}>
                <div>
                  <h3>{type.label}</h3>
                  <p className="type-description">{type.description}</p>
                </div>
                <span className="type-count">{typeQuestions.length} câu hỏi</span>
              </div>
              
              <div className="questions-list">
                {typeQuestions.map((question, index) => (
                  <div key={question.id} className="question-item">
                    <span className="question-number">{index + 1}</span>
                    <div className="question-content">
                      <p>{question.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {questions.length === 0 && (
        <div className="no-questions">
          <span className="no-questions-icon">📋</span>
          <h3>Chưa có câu hỏi nào</h3>
          <p>Nhấn nút "Thêm Câu hỏi" để bắt đầu tạo câu hỏi</p>
        </div>
      )}

      {/* Modal thêm câu hỏi */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Câu hỏi Hướng nghiệp</h3>
              <button className="btn-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="info-box">
                  <span className="info-icon">ℹ️</span>
                  <p>Bạn có thể thêm nhiều câu hỏi cùng lúc. Mỗi câu hỏi cần có nội dung và loại nghề nghiệp tương ứng.</p>
                </div>

                <div className="questions-form-list">
                  {newQuestions.map((question, index) => (
                    <div key={index} className="question-form-item">
                      <div className="form-item-header">
                        <h4>Câu hỏi {index + 1}</h4>
                        {newQuestions.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            × Xóa
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Nội dung câu hỏi <span className="required">*</span>
                        </label>
                        <textarea
                          value={question.content}
                          onChange={(e) => handleQuestionChange(index, 'content', e.target.value)}
                          placeholder="Ví dụ: Tôi thích làm việc với số liệu và dữ kiện"
                          rows="3"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Loại nghề nghiệp <span className="required">*</span>
                        </label>
                        <select
                          value={question.careerType}
                          onChange={(e) => handleQuestionChange(index, 'careerType', e.target.value)}
                          required
                        >
                          {careerTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label} - {type.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-add-more"
                  onClick={handleAddQuestion}
                >
                  + Thêm câu hỏi khác
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang tạo...' : `Tạo ${newQuestions.length} câu hỏi`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCareerQuestion;
