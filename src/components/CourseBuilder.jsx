import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { courseApi } from '../../api/courseApi';
import { learningPathApi, chapterApi, lessonApi, resourceApi } from '../../api/courseStructureApi';
import { uploadApi } from '../../api/uploadApi';
import { toast } from 'react-toastify';
import './CourseBuilder.css';

function CourseBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'learningPath', 'chapter', 'lesson', 'resource'
  const [modalParent, setModalParent] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // If courseId is provided, auto-select that course
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        handleSelectCourse(course);
      }
    }
  }, [courseId, courses]);  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAllCourses();
      
      if (response.statusCode === 200 && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách khóa học', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setLoading(true);
    
    try {
      const response = await courseApi.getCourseById(course.id);
      
      if (response.statusCode === 200 && response.data) {
        // Set learningPaths từ curLearningPath
        setStructure(response.data.curLearningPath?.learningPaths || []);
      }
    } catch (error) {
      toast.error('Không thể tải cấu trúc khóa học', {
        position: "top-right",
        autoClose: 3000,
      });
      setStructure([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const openAddModal = (type, parent = null) => {
    setModalType(type);
    setModalParent(parent);
    setFormData({});
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setModalType('');
    setModalParent(null);
    setFormData({});
    setSelectedFile(null);
    setUploading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name from filename
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: file.name,
          size: Math.round(file.size / 1024) // Convert to KB
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      switch (modalType) {
        case 'learningPath':
          response = await learningPathApi.createLearningPath({
            title: formData.title,
            position: parseInt(formData.position),
            courseId: selectedCourse.id,
          });
          break;
          
        case 'chapter':
          response = await chapterApi.createChapter({
            title: formData.title,
            position: parseInt(formData.position),
            learningPathId: modalParent.id,
          });
          break;
          
        case 'lesson':
          response = await lessonApi.createLesson({
            title: formData.title,
            position: parseInt(formData.position),
            duration: parseInt(formData.duration),
            chapterId: modalParent.id,
          });
          break;
          
        case 'resource':
          let uploadedUrl = formData.url || null;
          
          // Upload file nếu có file được chọn
          if (selectedFile && formData.type) {
            setUploading(true);
            try {
              switch (formData.type) {
                case 'VIDEO':
                  uploadedUrl = await uploadApi.uploadVideo(selectedFile);
                  break;
                case 'IMAGE':
                  uploadedUrl = await uploadApi.uploadImage(selectedFile);
                  break;
                case 'DOC':
                  uploadedUrl = await uploadApi.uploadDocument(selectedFile);
                  break;
              }
            } catch (uploadError) {
              throw new Error('Upload file thất bại: ' + uploadError.message);
            } finally {
              setUploading(false);
            }
          }
          
          response = await resourceApi.createResource({
            name: formData.name,
            url: uploadedUrl,
            type: formData.type || null,
            size: formData.size ? parseInt(formData.size) : null,
            lessonId: modalParent.id,
          });
          break;
      }
      
      toast.success('Thêm thành công!');
      closeAddModal();
      // Refresh structure
      if (selectedCourse) {
        await handleSelectCourse(selectedCourse);
      }
      
    } catch (error) {
      // toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.', {
      //   position: "top-right",
      //   autoClose: 3000,
      // });
    }
  };

  const renderAddForm = () => {
    switch (modalType) {
      case 'learningPath':
        return (
          <>
            <div className="form-group">
              <label>Tiêu đề *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="Nhập tiêu đề learning path..."
                required
              />
            </div>
            <div className="form-group">
              <label>Vị trí *</label>
              <input
                type="number"
                name="position"
                value={formData.position || ''}
                onChange={handleChange}
                placeholder="1"
                min="1"
                required
              />
            </div>
          </>
        );
        
      case 'chapter':
        return (
          <>
            <div className="form-group">
              <label>Tiêu đề *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="Nhập tiêu đề chapter..."
                required
              />
            </div>
            <div className="form-group">
              <label>Vị trí *</label>
              <input
                type="number"
                name="position"
                value={formData.position || ''}
                onChange={handleChange}
                placeholder="1"
                min="1"
                required
              />
            </div>
          </>
        );
        
      case 'lesson':
        return (
          <>
            <div className="form-group">
              <label>Tiêu đề *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="Nhập tiêu đề lesson..."
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Vị trí *</label>
                <input
                  type="number"
                  name="position"
                  value={formData.position || ''}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Thời lượng (phút) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration || ''}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
          </>
        );
        
      case 'resource':
        return (
          <>
            <div className="form-group">
              <label>Loại tài nguyên *</label>
              <select
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                required
              >
                <option value="">Chọn loại</option>
                <option value="VIDEO">Video</option>
                <option value="IMAGE">Image</option>
                <option value="DOC">DOC</option>
              </select>
            </div>
            
            {formData.type && (
              <div className="form-group">
                <label>Chọn file {formData.type} *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={
                    formData.type === 'VIDEO' ? 'video/*' :
                    formData.type === 'IMAGE' ? 'image/*' :
                    formData.type === 'DOC' ? '.pdf,.doc,.docx,.txt' : '*'
                  }
                />
                {selectedFile && (
                  <div className="file-info">
                    📎 {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
              </div>
            )}
            
            <div className="form-group">
              <label>Tên tài nguyên *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Nhập tên tài nguyên..."
                required
              />
            </div>
            
            <div className="form-group">
              <label>Kích thước (KB)</label>
              <input
                type="number"
                name="size"
                value={formData.size || ''}
                onChange={handleChange}
                placeholder="Tự động từ file"
                min="0"
                disabled={selectedFile !== null}
                readOnly={selectedFile !== null}
                style={selectedFile ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
              />
              <small style={{color: '#999', fontSize: '12px'}}>
                {selectedFile ? 'Kích thước được tự động lấy từ file' : 'Sẽ tự động lấy từ file nếu để trống'}
              </small>
            </div>
          </>
        );
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'learningPath': return 'Thêm Learning Path';
      case 'chapter': return 'Thêm Chapter';
      case 'lesson': return 'Thêm Lesson';
      case 'resource': return 'Thêm Resource';
      default: return 'Thêm mới';
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
    <div className="course-builder-page">
      <div className="builder-header">
        <div className="header-content">

          <div>
            <h1 className="builder-title">Course Builder</h1>
            <p className="builder-subtitle">Xây dựng cấu trúc khóa học chi tiết</p>
          </div>
        </div>
      </div>

      <div className="builder-content">
        <div className="builder-sidebar">
          <h3>Chọn khóa học</h3>
          <div className="course-list">
            {courses.map(course => (
              <div
                key={course.id}
                className={`course-item ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                onClick={() => handleSelectCourse(course)}
              >
                <div className="course-info">
                  <div className="course-name">{course.title}</div>
                  <div className="course-category">{course.category?.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="builder-main">
          {!selectedCourse ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Chọn một khóa học để bắt đầu</h3>
              <p>Chọn khóa học từ danh sách bên trái để xây dựng cấu trúc</p>
            </div>
          ) : (
            <div className="structure-container">
              <div className="structure-header">
                <div className="course-header-info">
                  <h2>{selectedCourse.title}</h2>
                  {selectedCourse.description && (
                    <p className="course-description">{selectedCourse.description}</p>
                  )}
                  <div className="course-meta">
                    {selectedCourse.price && (
                      <span className="course-price">💰 {selectedCourse.price.toLocaleString()} VNĐ</span>
                    )}
                    {selectedCourse.createdBy && (
                      <span className="course-author">👤 {selectedCourse.createdBy}</span>
                    )}
                  </div>
                </div>
                <button 
                  className="btn-add-primary"
                  onClick={() => openAddModal('learningPath')}
                >
                  + Thêm Learning Path
                </button>
              </div>

              <div className="structure-tree">
                {structure.length === 0 ? (
                  <div className="empty-tree">
                    <p>Chưa có nội dung. Hãy thêm Learning Path đầu tiên!</p>
                  </div>
                ) : (
                  [...structure].sort((a, b) => (a.position || 0) - (b.position || 0)).map((learningPath) => (
                    <div key={learningPath.id} className="tree-item level-1">
                      <div className="tree-item-header">
                        <button 
                          className="expand-btn"
                          onClick={() => toggleExpand(`lp-${learningPath.id}`)}
                        >
                          {expandedItems.has(`lp-${learningPath.id}`) ? '▼' : '▶'}
                        </button>
                        <span className="item-icon">📂</span>
                        <span className="item-title">{learningPath.title}</span>
                        <span className="item-position">#{learningPath.position}</span>
                        <button 
                          className="btn-add-small"
                          onClick={() => openAddModal('chapter', learningPath)}
                        >
                          + Chapter
                        </button>
                      </div>
                      
                      {expandedItems.has(`lp-${learningPath.id}`) && learningPath.chapters && 
                        [...learningPath.chapters].sort((a, b) => (a.position || 0) - (b.position || 0)).map((chapter) => (
                        <div key={chapter.id} className="tree-item level-2">
                          <div className="tree-item-header">
                            <button 
                              className="expand-btn"
                              onClick={() => toggleExpand(`ch-${chapter.id}`)}
                            >
                              {expandedItems.has(`ch-${chapter.id}`) ? '▼' : '▶'}
                            </button>
                            <span className="item-icon">📑</span>
                            <span className="item-title">{chapter.title}</span>
                            <span className="item-position">#{chapter.position}</span>
                            <button 
                              className="btn-add-small"
                              onClick={() => openAddModal('lesson', chapter)}
                            >
                              + Lesson
                            </button>
                          </div>
                          
                          {expandedItems.has(`ch-${chapter.id}`) && chapter.lessons && 
                            [...chapter.lessons].sort((a, b) => (a.position || 0) - (b.position || 0)).map((lesson) => (
                            <div key={lesson.id} className="tree-item level-3">
                              <div className="tree-item-header">
                                <button 
                                  className="expand-btn"
                                  onClick={() => toggleExpand(`ls-${lesson.id}`)}
                                >
                                  {expandedItems.has(`ls-${lesson.id}`) ? '▼' : '▶'}
                                </button>
                                <span className="item-icon">📝</span>
                                <span className="item-title">{lesson.title}</span>
                                <span className="item-position">#{lesson.position}</span>
                                <span className="item-duration">⏱️ {lesson.duration}m</span>
                                <button 
                                  className="btn-add-small"
                                  onClick={() => openAddModal('resource', lesson)}
                                >
                                  + Resource
                                </button>
                              </div>
                              
                              {expandedItems.has(`ls-${lesson.id}`) && lesson.resources && 
                                [...lesson.resources].sort((a, b) => (a.position || a.id || 0) - (b.position || b.id || 0)).map((resource) => (
                                <div key={resource.id} className="tree-item level-4">
                                  <div className="tree-item-header">
                                    <span className="item-icon">📎</span>
                                    <span className="item-title">{resource.name}</span>
                                    <span className="item-type">{resource.type}</span>
                                    {resource.size && <span className="item-size">{resource.size}KB</span>}
                                    {resource.url && (
                                      <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-view-resource"
                                        title={resource.url}
                                      >
                                        🔗 Xem
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getModalTitle()}</h2>
              <button onClick={closeAddModal} className="btn-close-modal">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="builder-form">
              {renderAddForm()}
              
              <div className="modal-actions">
                <button type="button" onClick={closeAddModal} className="btn-cancel" disabled={uploading}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? 'Đang upload...' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseBuilder;
