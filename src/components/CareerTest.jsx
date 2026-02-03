import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerQuestionApi } from '../../api/careerQuestionApi';
import { toast } from 'react-toastify';
import './CareerTest.css';

function CareerTest() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const questionsPerPage = 6;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

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
        toast.error('Không thể tải danh sách câu hỏi', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      toast.error('Đã xảy ra lỗi khi tải câu hỏi', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  const handleSubmit = async () => {
    // Kiểm tra đã trả lời hết chưa
    const unansweredCount = questions.filter(q => !answers[q.id]).length;
    if (unansweredCount > 0) {
      toast.warning(`Vui lòng trả lời hết ${unansweredCount} câu hỏi còn lại`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await careerQuestionApi.calculateCareerQuestion({ answers });
      
      if (response.statusCode === 200 || response.data || typeof response === 'string') {
        const careerType = response.data || response;
        setResult(careerType);
        toast.success('Đã tính toán kết quả hướng nghiệp!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error('Không thể tính toán kết quả', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error calculating career:', error);
      toast.error('Đã xảy ra lỗi khi tính toán kết quả', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCareerTypeName = (type) => {
    const types = {
      'R': 'Thực tế (Realistic)',
      'I': 'Nghiên cứu (Investigative)',
      'A': 'Nghệ thuật (Artistic)',
      'S': 'Xã hội (Social)',
      'E': 'Doanh nghiệp (Enterprising)',
      'C': 'Công việc văn phòng (Conventional)',
    };
    return types[type] || type;
  };

  const getCareerTypeDescription = (type) => {
    const descriptions = {
      'R': 'Bạn phù hợp với các công việc thực hành, làm việc với máy móc, thiết bị và công cụ.',
      'I': 'Bạn phù hợp với các công việc nghiên cứu, phân tích và giải quyết vấn đề.',
      'A': 'Bạn phù hợp với các công việc sáng tạo, nghệ thuật và thiết kế.',
      'S': 'Bạn phù hợp với các công việc hỗ trợ, giúp đỡ và làm việc với người khác.',
      'E': 'Bạn phù hợp với các công việc lãnh đạo, kinh doanh và thuyết phục.',
      'C': 'Bạn phù hợp với các công việc văn phòng, quản lý dữ liệu và quy trình.',
    };
    return descriptions[type] || '';
  };

  const getCurrentPageQuestions = () => {
    const startIndex = currentPage * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return questions.slice(startIndex, endIndex);
  };

  const getProgress = () => {
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / questions.length) * 100;
  };

  const canGoNext = () => {
    const currentQuestions = getCurrentPageQuestions();
    return currentQuestions.every(q => answers[q.id] !== undefined);
  };

  if (loading) {
    return (
      <div className="career-test-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="career-test-page">
        <div className="result-container">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Về trang chủ
          </button>
          
          <div className="result-card">
            <div className="result-icon">🎯</div>
            <h1 className="result-title">Kết quả Hướng nghiệp</h1>
            <div className="result-type">
              <h2>{getCareerTypeName(result)}</h2>
              <p className="result-description">{getCareerTypeDescription(result)}</p>
            </div>
            
            <div className="result-actions">
              <button className="btn-primary" onClick={() => {
                setResult(null);
                setAnswers({});
                setCurrentPage(0);
              }}>
                Làm lại bài test
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                Khám phá khóa học
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="career-test-page">
      <div className="test-container">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Quay lại
        </button>

        <div className="test-header">
          <h1 className="test-title">Bài Test Hướng Nghiệp</h1>
          <p className="test-subtitle">
            Trả lời các câu hỏi dưới đây để khám phá nghề nghiệp phù hợp với bạn
          </p>
        </div>

        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getProgress()}%` }}></div>
          </div>
          <div className="progress-text">
            {Object.keys(answers).length} / {questions.length} câu hỏi đã trả lời
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="no-questions">
            <span className="no-questions-icon">📋</span>
            <h3>Chưa có câu hỏi</h3>
            <p>Hiện tại chưa có câu hỏi nào. Vui lòng quay lại sau!</p>
          </div>
        ) : (
          <>
            <div className="questions-container">
              {getCurrentPageQuestions().map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">
                      Câu {currentPage * questionsPerPage + index + 1}
                    </span>
                  </div>
                  <h3 className="question-content">{question.content}</h3>
                  
                  <div className="answer-options">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="answer-option">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={value}
                          checked={answers[question.id] === value}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        />
                        <span className="answer-label">
                          {value === 1 && 'Rất không đồng ý'}
                          {value === 2 && 'Không đồng ý'}
                          {value === 3 && 'Trung lập'}
                          {value === 4 && 'Đồng ý'}
                          {value === 5 && 'Rất đồng ý'}
                        </span>
                        <span className="answer-value">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="navigation-buttons">
              <button
                className="btn-nav btn-prev"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 0}
              >
                ← Trang trước
              </button>
              
              <div className="page-indicator">
                Trang {currentPage + 1} / {totalPages}
              </div>

              {currentPage === totalPages - 1 ? (
                <button
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xem kết quả'}
                </button>
              ) : (
                <button
                  className="btn-nav btn-next"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!canGoNext()}
                >
                  Trang sau →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CareerTest;
