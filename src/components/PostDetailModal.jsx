import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { commentApi } from '../../api/commentApi';
import './PostDetailModal.css';

function PostDetailModal({ post, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentApi.getCommentsByPostId(post.id);
      if (response.statusCode === 200 && response.data) {
        // Sort comments by ID in descending order (newest first)
        const sortedComments = response.data.sort((a, b) => b.id - a.id);
        setComments(sortedComments);
      } else {
        setError(response.error || 'Không thể tải bình luận');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải bình luận');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      const response = await commentApi.createComment(post.id, {
        content: newComment,
      });
      
      if (response.statusCode === 200 || response.id) {
        setNewComment('');
        fetchComments();
      } else {
        alert(response.error || 'Không thể tạo bình luận');
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi tạo bình luận');
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết bài viết</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Post Content */}
          <div className="post-detail-content">
            <div className="post-detail-header">
              <div className="post-author-info">
                <div className="author-avatar">
                  {post.account?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="post-detail-title">{post.title}</h3>
                  <span className="post-detail-author">
                    bởi {post.account || 'Ẩn danh'}
                  </span>
                </div>
              </div>
            </div>
            <div className="post-detail-body">
              <p>{post.content}</p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h3 className="comments-title">
              💬 Bình luận ({comments.length})
            </h3>

            {loading ? (
              <div className="comments-loading">
                <div className="spinner-small"></div>
                <p>Đang tải bình luận...</p>
              </div>
            ) : error ? (
              <div className="comments-error">
                <p>{error}</p>
              </div>
            ) : (
              <>
                {/* Comment Form */}
                {user ? (
                  <form className="comment-form" onSubmit={handleSubmitComment}>
                    <div className="comment-input-wrapper">
                      <div className="comment-avatar">
                        {user.userLogin?.fullName?.charAt(0)?.toUpperCase() || 
                         user.fullName?.charAt(0)?.toUpperCase() || 
                         user.email?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <textarea
                        className="comment-input"
                        placeholder="Viết bình luận của bạn..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows="3"
                      />
                    </div>
                    <div className="comment-actions">
                      <button type="submit" className="btn-submit-comment">
                        Gửi bình luận
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="login-prompt">
                    <p>Vui lòng đăng nhập để bình luận</p>
                  </div>
                )}

                {/* Comments List */}
                <div className="comments-list">
                  {comments.length === 0 ? (
                    <div className="no-comments">
                      <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-avatar">
                          {comment.account?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">
                              {comment.account || 'Ẩn danh'}
                            </span>
                          </div>
                          <p className="comment-text">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailModal;
