import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="notfound-actions">
          <button className="btn-primary" onClick={() => navigate("/")}>
            Go Home
          </button>
          <button className="btn-outline" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
