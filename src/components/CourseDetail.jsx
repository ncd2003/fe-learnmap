import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import './CourseDetail.css';

function CourseDetail({ courseId, onBack }) {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedPaths, setExpandedPaths] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getCourseById(courseId);
        
        if (response.statusCode === 200 && response.data) {
          setCourseData(response.data);
          // Auto expand first path and chapter
          const learningPaths = response.data.curLearningPath?.learningPaths || [];
          if (learningPaths.length > 0) {
            const firstPathId = learningPaths[0].id;
            setExpandedPaths({ [firstPathId]: true });
            if (learningPaths[0].chapters?.length > 0) {
              const firstChapterId = learningPaths[0].chapters[0].id;
              setExpandedChapters({ [firstChapterId]: true });
            }
          }
        } else {
          // Nếu có lỗi, chuyển hướng về trang Plans
          setError(response.error || 'Không thể tải thông tin khóa học');
          setTimeout(() => {
            navigate('/plans');
          }, 2000);
        }
      } catch (err) {
        // Nếu có lỗi exception, chuyển hướng về trang Plans
        setError('Đã xảy ra lỗi khi tải dữ liệu');
        console.error(err);
        setTimeout(() => {
          navigate('/plans');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId, navigate]);

  const togglePath = (pathId) => {
    setExpandedPaths(prev => ({
      ...prev,
      [pathId]: !prev[pathId]
    }));
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTotalStats = () => {
    const learningPaths = courseData?.curLearningPath?.learningPaths || [];
    if (learningPaths.length === 0) return { paths: 0, chapters: 0, lessons: 0, duration: 0 };
    
    let totalChapters = 0;
    let totalLessons = 0;
    let totalDuration = 0;

    learningPaths.forEach(path => {
      totalChapters += path.chapters?.length || 0;
      path.chapters?.forEach(chapter => {
        totalLessons += chapter.lessons?.length || 0;
        chapter.lessons?.forEach(lesson => {
          totalDuration += lesson.duration || 0;
        });
      });
    });

    return {
      paths: learningPaths.length,
      chapters: totalChapters,
      lessons: totalLessons,
      duration: totalDuration
    };
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="spinner-large"></div>
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-detail-error">
        <p>{error}</p>
        <button onClick={onBack} className="btn-back">Quay lại</button>
      </div>
    );
  }

  if (!courseData) return null;

  const stats = getTotalStats();

  return (
    <div className="course-detail-page">
      {/* Header */}
      <div className="course-header">
        <button onClick={onBack} className="btn-back-header">
          ← Quay lại
        </button>
        <div className="course-header-content">
          <div className="course-header-info">
            <h1 className="course-title-main">{courseData.title || 'Khóa học'}</h1>
            <p className="course-description-main">{courseData.description || 'Mô tả khóa học'}</p>
            
            <div className="course-meta-stats">
              <div className="meta-item">
                <span className="meta-icon">📚</span>
                <div>
                  <div className="meta-value">{stats.paths}</div>
                  <div className="meta-label">Lộ trình</div>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📖</span>
                <div>
                  <div className="meta-value">{stats.chapters}</div>
                  <div className="meta-label">Chương</div>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🎬</span>
                <div>
                  <div className="meta-value">{stats.lessons}</div>
                  <div className="meta-label">Bài học</div>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <div>
                  <div className="meta-value">{formatDuration(stats.duration)}</div>
                  <div className="meta-label">Tổng thời lượng</div>
                </div>
              </div>
            </div>

          </div>
          
          {courseData.thumbnailUrl && (
            <div className="course-header-thumbnail">
              <img src={courseData.thumbnailUrl} alt={courseData.title} />
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div className="course-content-wrapper">
        <div className="course-sidebar">
          <h2 className="sidebar-title">Nội dung khóa học</h2>
          
          <div className="learning-paths-list">
            {courseData.curLearningPath?.learningPaths && courseData.curLearningPath.learningPaths.length > 0 ? (
              [...courseData.curLearningPath.learningPaths].sort((a, b) => (a.position || 0) - (b.position || 0)).map((path, pathIndex) => (
                <div key={path.id} className="learning-path-item">
                  <div 
                    className="path-header"
                    onClick={() => togglePath(path.id)}
                  >
                    <div className="path-title-wrapper">
                      <span className="expand-icon">{expandedPaths[path.id] ? '▼' : '▶'}</span>
                      <div>
                        <div className="path-number">Lộ trình {pathIndex + 1}</div>
                        <h3 className="path-title">{path.title}</h3>
                      </div>
                    </div>
                    <div className="path-stats">
                      {path.chapters?.length || 0} chương
                    </div>
                  </div>

                  {expandedPaths[path.id] && path.chapters && (
                    <div className="chapters-list">
                      {[...path.chapters].sort((a, b) => (a.position || 0) - (b.position || 0)).map((chapter, chapterIndex) => (
                        <div key={chapter.id} className="chapter-item">
                          <div 
                            className="chapter-header"
                            onClick={() => toggleChapter(chapter.id)}
                          >
                            <div className="chapter-title-wrapper">
                              <span className="expand-icon-small">{expandedChapters[chapter.id] ? '−' : '+'}</span>
                              <div>
                                <div className="chapter-number">Chương {chapterIndex + 1}</div>
                                <h4 className="chapter-title">{chapter.title}</h4>
                              </div>
                            </div>
                            <div className="chapter-lessons-count">
                              {chapter.lessons?.length || 0} bài
                            </div>
                          </div>

                          {expandedChapters[chapter.id] && chapter.lessons && (
                            <div className="lessons-list">
                              {[...chapter.lessons].sort((a, b) => (a.position || 0) - (b.position || 0)).map((lesson, lessonIndex) => (
                                <div key={lesson.id} className="lesson-container">
                                  <div 
                                    className={`lesson-item ${activeLesson?.id === lesson.id ? 'active' : ''}`}
                                    onClick={() => {
                                      setActiveLesson(lesson);
                                      toggleLesson(lesson.id);
                                    }}
                                  >
                                    <div className="lesson-info">
                                      <span className="expand-icon-tiny">{expandedLessons[lesson.id] ? '▼' : '▶'}</span>
                                      <span className="lesson-number">{lessonIndex + 1}</span>
                                      <span className="lesson-title">{lesson.title}</span>
                                    </div>
                                    <span className="lesson-duration">{formatDuration(lesson.duration)}</span>
                                  </div>

                                  {expandedLessons[lesson.id] && lesson.resources && lesson.resources.length > 0 && (
                                    <div className="lesson-resources-inline">
                                      {[...lesson.resources].sort((a, b) => (a.position || a.id || 0) - (b.position || b.id || 0)).map(resource => (
                                        <div 
                                          key={resource.id} 
                                          className={`resource-inline-item ${selectedResource?.id === resource.id ? 'active' : ''}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedResource(resource);
                                          }}
                                        >
                                          <span className="resource-inline-icon">
                                            {resource.type === 'VIDEO' ? '🎥' : resource.type === 'IMAGE' ? '🖼️' : '📄'}
                                          </span>
                                          <span className="resource-inline-name">{resource.name}</span>
                                          <span className="resource-inline-type">{resource.type}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-content">
                <p>Chưa có nội dung khóa học</p>
              </div>
            )}
          </div>
        </div>

        <div className="course-main-content">
          {selectedResource ? (
            <div className="resource-preview">
              <div className="preview-header">
                <div>
                  <h2>{selectedResource.name}</h2>
                  <div className="preview-meta">
                    <span className="preview-type-badge">{selectedResource.type}</span>
                    {selectedResource.size && (
                      <span className="preview-size-badge">{selectedResource.size} KB</span>
                    )}
                  </div>
                </div>
                <button 
                  className="btn-close-preview"
                  onClick={() => setSelectedResource(null)}
                  title="Đóng"
                >
                  ✕
                </button>
              </div>

              <div className="preview-body">
                {selectedResource.url ? (
                  <>
                    {selectedResource.type === 'VIDEO' && (
                      <video 
                        controls 
                        className="preview-video"
                        key={selectedResource.url}
                      >
                        <source src={selectedResource.url} type="video/mp4" />
                        Trình duyệt không hỗ trợ video.
                      </video>
                    )}
                    
                    {selectedResource.type === 'IMAGE' && (
                      <div className="preview-image-container">
                        <img 
                          src={selectedResource.url} 
                          alt={selectedResource.name}
                          className="preview-image"
                        />
                      </div>
                    )}
                    
                    {selectedResource.type === 'DOC' && (
                      <div className="preview-document">
                        <div className="doc-actions">
                          <a 
                            href={selectedResource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-download-doc"
                          >
                            📥 Tải xuống
                          </a>
                        </div>
                        <iframe 
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedResource.url)}&embedded=true`}
                          className="preview-iframe"
                          title={selectedResource.name}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="preview-no-url">
                    <p>⚠️ Tài nguyên chưa có URL</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-lesson-selected">
              <div className="empty-state-icon">🎯</div>
              <h3>Chọn tài nguyên để xem</h3>
              <p>Click vào bất kỳ tài nguyên nào (video, image, doc) để xem nội dung</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
