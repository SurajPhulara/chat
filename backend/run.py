from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Drop all existing tables (be careful in production!)
        db.drop_all()
        # Recreate tables
        db.create_all()
    app.run(debug=True)