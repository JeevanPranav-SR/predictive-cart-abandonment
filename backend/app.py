"""
Flask entry point for the cart-abandonment demo API.
"""

from flask import Flask, jsonify
from flask_cors import CORS

from config import CORS_ORIGINS
from database import init_db
from routes.auth import auth_bp
from routes.checkout import checkout_bp
from routes.dashboard import dashboard_bp
from routes.health import health_bp
from routes.model import model_bp
from routes.predict import predict_bp
from routes.session import session_bp


def create_app():
    app = Flask(__name__)
    CORS(app, origins=CORS_ORIGINS)

    init_db()

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(checkout_bp)
    app.register_blueprint(session_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(model_bp)

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"error": "not_found"}), 404

    @app.errorhandler(500)
    def server_error(_error):
        return jsonify({"error": "server_error", "message": "Unexpected server error"}), 500

    return app


if __name__ == "__main__":
    # Local college-demo server. Debug stays on so students can see stack traces.
    application = create_app()
    application.run(host="127.0.0.1", port=5001, debug=True)
