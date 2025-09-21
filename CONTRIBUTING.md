# Contributing to CSV Upload Application

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/csv-upload-app.git
   cd csv-upload-app
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📝 Development Guidelines

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages
Use conventional commit format:
```
type(scope): description

Examples:
feat(auth): add password reset functionality
fix(upload): resolve file validation issue
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(api): optimize database queries
test(auth): add unit tests for login
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests if applicable
   - Update documentation if needed

3. **Test your changes**
   ```bash
   # Test frontend
   cd frontend && npm test
   
   # Test backend
   cd backend && npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🏗️ Project Structure

```
csv-upload-app/
├── frontend/          # React application
├── backend/           # Node.js API
├── database/          # Database scripts
├── docs/             # Documentation
└── tests/            # Test files
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🐛 Bug Reports

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, etc.)

## 💡 Feature Requests

For feature requests, please:
- Describe the feature clearly
- Explain the use case
- Consider implementation complexity
- Check if similar features exist

## 📋 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks or political discussions
- Spam or off-topic discussions

## 📞 Getting Help

- Create an issue for bugs or feature requests
- Join our discussions for questions
- Contact maintainers for urgent issues

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🚀
