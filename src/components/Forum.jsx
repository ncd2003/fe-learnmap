import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { topicApi } from '../../api/topicApi';
import { postApi } from '../../api/postApi';
import { toast } from 'react-toastify';
import TopicDetail from './TopicDetail';
import './Forum.css';

function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicPostCounts, setTopicPostCounts] = useState({});
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    published: true,
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicApi.getAllTopics();
      if (response.statusCode === 200 && response.data) {
        // Filter only published topics
        const publishedTopics = response.data.filter(topic => topic.published);
        setTopics(publishedTopics);
        
        // Fetch post counts for each topic
        const postCounts = {};
        await Promise.all(
          publishedTopics.map(async (topic) => {
            try {
              const postsResponse = await postApi.getPostsByTopicId(topic.id);
              postCounts[topic.id] = postsResponse.data?.length || 0;
            } catch (err) {
              postCounts[topic.id] = 0;
            }
          })
        );
        setTopicPostCounts(postCounts);
      } else {
        setError(response.error || 'Không thể tải danh sách chủ đề');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vui lòng đăng nhập để tạo chủ đề mới', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await topicApi.createTopic(newTopic);
      if (response.statusCode === 200 || response.id) {
        toast.success('Tạo chủ đề thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
        setShowCreateModal(false);
        setNewTopic({ title: '', description: '', published: true });
        fetchTopics();
      } else {
        // Toast đã được xử lý bởi AuthorBaseApi interceptor
        console.error('Error creating topic:', response);
      }
    } catch (err) {
      // Toast đã được xử lý bởi AuthorBaseApi interceptor
      console.error('Error creating topic:', err);
    }
  };

  // If a topic is selected, show TopicDetail
  if (selectedTopic) {
    return <TopicDetail topic={selectedTopic} user={user} onBack={() => setSelectedTopic(null)} />;
  }

  if (loading) {
    return (
      <div className="forum-page">
        <div className="forum-header">
          <button className="btn-back" onClick={() => navigate('/')}>← Quay lại</button>
          <h1>💬 Diễn đàn</h1>
        </div>
        <div className="forum-loading">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forum-page">
        <div className="forum-header">
          <button className="btn-back" onClick={() => navigate('/')}>← Quay lại</button>
          <h1>Diễn đàn</h1>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-page">
      <div className="forum-header">
        <button className="btn-back" onClick={() => navigate('/')}>← Quay lại</button>
        <h1>Diễn đàn học tập</h1>
        {user && (user.userLogin?.role === 'ADMIN' || user.userLogin?.role === 'STAFF') && (
          <button className="btn-create-topic" onClick={() => setShowCreateModal(true)}>
            ✏️ Tạo chủ đề mới
          </button>
        )}
      </div>

      <div className="forum-container">
        <div className="forum-intro">
          <h2>Chào mừng đến với cộng đồng LearnMap!</h2>
          <p>Tham gia thảo luận, chia sẻ kinh nghiệm và học hỏi từ cộng đồng học viên</p>
        </div>

        <div className="topics-list">
          {topics.length === 0 ? (
            <div className="no-topics">
              <p>Chưa có chủ đề nào. Hãy là người đầu tiên tạo chủ đề!</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="topic-card">
                <div className="topic-icon">📌</div>
                <div className="topic-content">
                  <h3 className="topic-title">{topic.title}</h3>
                  <p className="topic-description">{topic.description}</p>
                  <div className="topic-meta">
                    <span className="topic-stat">📝 {topicPostCounts[topic.id] || 0} bài viết</span>
                  </div>
                </div>
                <button className="btn-view-topic" onClick={() => setSelectedTopic(topic)}>
                  Xem chi tiết →
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo chủ đề mới</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTopic}>
              <div className="form-group">
                <label htmlFor="title">Tiêu đề chủ đề *</label>
                <input
                  type="text"
                  id="title"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  placeholder="Nhập tiêu đề chủ đề..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Mô tả *</label>
                <textarea
                  id="description"
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  placeholder="Mô tả về chủ đề này..."
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newTopic.published}
                    onChange={(e) => setNewTopic({ ...newTopic, published: e.target.checked })}
                  />
                  Xuất bản ngay
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Tạo chủ đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forum;
