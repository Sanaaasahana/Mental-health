// Utility functions
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3003/api' 
  : `${window.location.protocol}//${window.location.hostname}/api`;

async function getCurrentUser() {
    const token = localStorage.getItem('mindful_token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'x-auth-token': token,
            },
        });

        if (!response.ok) {
            localStorage.removeItem('mindful_token');
            return null;
        }

        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

function checkAuth() {
  const token = localStorage.getItem('mindful_token');
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
   // Additionally, you could verify the token with the server here
  return true;
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("mindful_token");
    window.location.href = "login.html";
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  if (!document.getElementById("notification-styles")) {
    const styles = document.createElement("style");
    styles.id = "notification-styles";
    styles.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease-out;
      }

      .notification.success {
        background: rgba(40, 167, 69, 0.95);
        color: white;
        border: 1px solid rgba(40, 167, 69, 0.3);
      }

      .notification.error {
        background: rgba(220, 53, 69, 0.95);
        color: white;
        border: 1px solid rgba(220, 53, 69, 0.3);
      }

      .notification.info {
        background: rgba(23, 162, 184, 0.95);
        color: white;
        border: 1px solid rgba(23, 162, 184, 0.3);
      }

      .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
      }

      .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.3s ease;
      }

      .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Call initialization when script loads
// initializeSampleData(); // We no longer need this

// Export functions globally
window.getCurrentUser = getCurrentUser;
window.checkAuth = checkAuth;
window.logout = logout;
window.showNotification = showNotification;
