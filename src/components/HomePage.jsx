import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { courseApi } from '../../api/courseApi';
import { categoryApi } from '../../api/categoryApi';
import CourseDetail from './CourseDetail';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [pendingCourseId, setPendingCourseId] = useState(null);

  // Lắng nghe event login thành công để tiếp tục xem course
  useEffect(() => {
    const handleLoginSuccess = () => {
      if (pendingCourseId) {
        setSelectedCourseId(pendingCourseId);
        setPendingCourseId(null);
      }
    };

    window.addEventListener('login-success', handleLoginSuccess);
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
    };
  }, [pendingCourseId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch published courses and categories in parallel (for user view)
        const [coursesResponse, categoriesResponse] = await Promise.all([
          courseApi.getAllPublishedCourses(),
          categoryApi.getAllCategoriesPublic(),
        ]);
        
        if (coursesResponse.statusCode === 200 && coursesResponse.data) {
          // Filter out invalid courses (courses with null title)
          const validCourses = Array.isArray(coursesResponse.data) 
            ? coursesResponse.data.filter(course => course && course.title && course.id)
            : [];
          setCourses(validCourses);
          setFilteredCourses(validCourses);
        } else {
          setError(coursesResponse.error || 'Không thể tải danh sách khóa học');
        }
        
        if (categoriesResponse.statusCode === 200 && categoriesResponse.data) {
          // Add "All" category at the beginning
          const allCategories = [
            { id: 'all', name: 'Tất cả', icon: '📚' },
            ...categoriesResponse.data.map(cat => ({
              id: cat.id,
              name: cat.name,
              description: cat.description,
              icon: getCategoryIcon(cat.name),
            }))
          ];
          setCategories(allCategories);
        } else {
          console.error('Category response error:', categoriesResponse);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get icon based on category name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Tin học': '💻',
      'Marketing': '📊',
      'Toán': '🔢',
      'Lập trình': '💻',
      'Thiết kế': '🎨',
      'Kinh doanh': '💼',
      'Ngoại ngữ': '🌍',
      'Tiếng Anh': '🇬🇧',
      'Tiếng Nhật': '🇯🇵',
      'Tiếng Hàn': '🇰🇷',
      'Tiếng Trung': '🇨🇳',
      'Tiếng Pháp': '🇫🇷',
      'Khoa học': '🔬',
      'Vật lý': '⚛️',
      'Hóa học': '🧪',
      'Sinh học': '🧬',
      'Lịch sử': '📜',
      'Địa lý': '🗺️',
      'Văn học': '📖',
      'Âm nhạc': '🎵',
      'Nghệ thuật': '🎭',
      'Thể thao': '⚽',
      'Nấu ăn': '👨‍🍳',
      'Nhiếp ảnh': '📷',
      'Video': '🎬',
      'Kế toán': '🧮',
      'Tài chính': '💰',
      'Quản trị': '📋',
      'Y học': '⚕️',
      'Công nghệ': '⚙️',
      'AI': '🤖',
      'Data Science': '📈',
      'Web Development': '🌐',
      'Mobile': '📱',
      'Game': '🎮',
      'Blockchain': '⛓️',
      'IoT': '🔌',
      'Cloud Computing': '☁️',
      'Bảo mật': '🔒',
    };
    return iconMap[categoryName] || '📚';
  };

  const handleCourseClick = (courseId) => {
    // Kiểm tra nếu user chưa login
    if (!user) {
      // Lưu courseId đang chờ
      setPendingCourseId(courseId);
      // Hiển thị login modal
      window.dispatchEvent(new CustomEvent('show-login-modal'));
    } else {
      // Đã login, hiển thị course detail
      setSelectedCourseId(courseId);
    }
  };

  useEffect(() => {
    const fetchCoursesByCategory = async () => {
      if (selectedCategory === 'all') {
        // Apply search filter on all courses
        let result = Array.isArray(courses) ? courses : [];
        if (searchTerm) {
          result = result.filter(course =>
            course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setFilteredCourses(result);
      } else {
        try {
          setLoading(true);
          const response = await courseApi.getCoursesByCategoryId(selectedCategory);
          if (response.statusCode === 200 && response.data) {
            // Apply search filter on category courses
            let result = Array.isArray(response.data) ? response.data : [];
            if (searchTerm) {
              result = result.filter(course =>
                course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
            setFilteredCourses(result);
          } else {
            setFilteredCourses([]);
          }
        } catch (err) {
          console.error('Error fetching courses by category:', err);
          // Fallback to client-side filtering
          const coursesArray = Array.isArray(courses) ? courses : [];
          let result = coursesArray.filter(course => 
            course.categoryId === selectedCategory || 
            course.category?.id === selectedCategory
          );
          if (searchTerm) {
            result = result.filter(course =>
              course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              course.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          setFilteredCourses(result);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCoursesByCategory();
  }, [selectedCategory, searchTerm, courses]);

  const formatPrice = (price) => {
    if (!price || price === 0) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getCategoryDisplay = (course) => {
    // Handle category if it's an object with name
    if (course.category && typeof course.category === 'object' && course.category.name) {
      const icon = getCategoryIcon(course.category.name);
      return `${icon} ${course.category.name}`;
    }
    // Handle category if it's a string (backend now returns category name as string)
    if (course.category && typeof course.category === 'string') {
      // If it looks like a Java object (contains @), use default
      if (course.category.includes('@')) {
        return '📚 Khóa học';
      }
      // Otherwise it's the category name
      const icon = getCategoryIcon(course.category);
      return `${icon} ${course.category}`;
    }
    // Fallback to default
    return '📚 Khóa học';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  // Show course detail if a course is selected
  if (selectedCourseId) {
    return <CourseDetail courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />;
  }

  return (
    <div className="home-page">
      {/* Top Banner */}
      <div className="top-banner">
        <p>🎉 Ưu đãi đặc biệt: Giảm 50% cho tất cả khóa học trong tháng này! <a href="#">Đăng ký ngay →</a></p>
      </div>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img src="https://learnmap-media.s3.us-east-1.amazonaws.com/logo/learnmap_logo.png" alt="LearnMap" className="logo-image" />
          </div>
          <div className="nav-menu">
            <a href="#" className="nav-link active">Trang chủ</a>
            <a href="#" className="nav-link">Tìm kiếm trường</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/career-test'); }}>
              Hướng nghiệp
            </a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/plans'); }}>
              Gói dịch vụ
            </a>
            <a href="#" className="nav-link">Tài liệu học tập</a>
            <a href="#" className="nav-link">Khóa học hỗ trợ</a>
            <a href="#" className="nav-link">Luyện thi</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/forum'); }}>
               Diễn đàn
            </a>
          </div>
          <div className="nav-actions">
            {/* <button className="btn-search">🔍</button> */}
            {user && (user.userLogin?.role === 'ADMIN' || user.userLogin?.role === 'STAFF') && (
              <button className="btn-admin" onClick={() => navigate('/dashboard')}>⚙️ Dashboard</button>
            )}
            {user ? (
              <>
                <span className="user-name">Xin chào, {user.userLogin?.fullName || user.fullName || user.email}</span>
                <button className="btn-logout" onClick={logout}>Đăng xuất</button>
              </>
            ) : (
              <>
                <button className="btn-register" onClick={() => navigate('/register')}>Đăng ký</button>
                <button className="btn-login" onClick={() => navigate('/login')}>Đăng nhập</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">✨ Nền tảng học trực tuyến #1 Việt Nam</div>
            <h1 className="hero-title">
              Nâng tầm tri thức<br/>
              <span className="highlight-text">Chinh phục tương lai</span>
            </h1>
            <p className="hero-description">
              Học mọi lúc, mọi nơi với hơn {courses.length} khóa học chất lượng cao từ đội ngũ giảng viên hàng đầu.
              Cam kết đồng hành cùng bạn trên mọi chặng đường học tập.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">Khám phá khóa học</button>
              <button className="btn-secondary">Học thử miễn phí</button>
            </div>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Học linh hoạt</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Chứng chỉ uy tín</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-img-wrapper">
              <div className="achievement-badge badge-1">
                <span className="badge-icon">🏆</span>
                <div>
                  <div className="badge-number">50K+</div>
                  <div className="badge-text">Học viên</div>
                </div>
              </div>
              <div className="achievement-badge badge-2">
                <span className="badge-icon">⭐</span>
                <div>
                  <div className="badge-number">4.9/5</div>
                  <div className="badge-text">Đánh giá</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-container">
          <h2 className="section-title">Danh mục khóa học</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category.id}
                className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="section-container">
          <div className="search-wrapper">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm khóa học, chủ đề, kỹ năng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Khóa học nổi bật</h2>
              <p className="section-subtitle">Khám phá các khóa học được yêu thích nhất</p>
            </div>
            <div className="course-count">
              <strong>{filteredCourses.length}</strong> khóa học
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="no-courses">
              <div className="no-courses-icon">📚</div>
              <h3>Không tìm thấy khóa học phù hợp</h3>
              <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="btn-reset">
                  Xem tất cả khóa học
                </button>
              )}
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <div key={course.id} className="course-card" onClick={() => handleCourseClick(course.id)}>
                  <div className="course-image">
                    <img
                      src={course.thumbnailUrl || 'https://via.placeholder.com/400x250?text=Khoa+Hoc'}
                      alt={course.title || 'Khóa học'}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x250?text=Khoa+Hoc';
                      }}
                    />
                    <div className="course-badge">Bán chạy</div>
                    {(!course.price || course.price === 0) && <div className="course-free-tag">Miễn phí</div>}
                  </div>
                  <div className="course-body">
                    <div className="course-category">{getCategoryDisplay(course)}</div>
                    <h3 className="course-title">{course.title || 'Khóa học'}</h3>
                    <p className="course-description">{course.description || 'Chưa có mô tả'}</p>
                    
                    {/* <div className="course-instructor">
                      <div className="instructor-avatar">👨‍🏫</div>
                      <span className="instructor-name">Giảng viên chuyên nghiệp</span>
                    </div> */}

                    {/* <div className="course-stats">
                      <div className="stat">
                        <span className="stat-icon">👥</span>
                        <span>1,234</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">⭐</span>
                        <span>4.8 (256)</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">🎬</span>
                        <span>45 bài</span>
                      </div>
                    </div> */}

                    <div className="course-footer">
                      <div>
                        {/* {!course.price || course.price === 0 ? (
                          <span className="price-free">Miễn phí</span>
                        ) : (
                          <>
                            <span className="price-current">{formatPrice(course.price)}</span>
                            <span className="price-original">{formatPrice(course.price * 1.5)}</span>
                          </>
                        )} */}
                      </div>
                      <button className="btn-enroll">Đăng ký ngay</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-us-section">
        <div className="section-container">
          <h2 className="section-title center">Tại sao chọn LearnMap?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon-large">🎯</span>
              </div>
              <h3>Nội dung chất lượng</h3>
              <p>Khóa học được biên soạn bởi đội ngũ chuyên gia hàng đầu với nội dung cập nhật liên tục</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon-large">⏰</span>
              </div>
              <h3>Học mọi lúc mọi nơi</h3>
              <p>Truy cập khóa học 24/7 trên mọi thiết bị, học theo tiến độ của riêng bạn</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon-large">💰</span>
              </div>
              <h3>Chi phí hợp lý</h3>
              <p>Học phí phải chăng với nhiều ưu đãi, cam kết hoàn tiền nếu không hài lòng</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon-large">🏆</span>
              </div>
              <h3>Chứng chỉ uy tín</h3>
              <p>Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Học viên tin tưởng</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{courses.length}+</div>
              <div className="stat-label">Khóa học chất lượng</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100+</div>
              <div className="stat-label">Giảng viên chuyên nghiệp</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Học viên hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-logo">
                <img src="https://learnmap-media.s3.us-east-1.amazonaws.com/logo/learnmap_logo.png" alt="LearnMap" className="logo-image" />
              </div>
              <p className="footer-desc">
                Nền tảng học trực tuyến hàng đầu Việt Nam, mang đến trải nghiệm học tập chất lượng cao cho mọi người.
              </p>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📺</a>
              </div>
            </div>
            <div className="footer-column">
              <h4>Về LearnMap</h4>
              <ul className="footer-links">
                <li><a href="#">Giới thiệu</a></li>
                <li><a href="#">Đội ngũ</a></li>
                <li><a href="#">Tuyển dụng</a></li>
                <li><a href="#">Liên hệ</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Khóa học</h4>
              <ul className="footer-links">
                <li><a href="#">Lập trình</a></li>
                <li><a href="#">Thiết kế</a></li>
                <li><a href="#">Marketing</a></li>
                <li><a href="#">Kinh doanh</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Hỗ trợ</h4>
              <ul className="footer-links">
                <li><a href="#">Trung tâm trợ giúp</a></li>
                <li><a href="#">Điều khoản</a></li>
                <li><a href="#">Chính sách</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 LearnMap. All rights reserved.</p>
            <p>Liên hệ: <strong>0328395273</strong> | Email: <strong>huyan119022004@gmail.com</strong>| Địa chỉ: <strong>335 - Lê Duẩn - Nghệ An</strong></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
