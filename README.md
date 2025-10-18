# MiniShop - Full-Stack eCommerce System

A complete eCommerce application built with Node.js, Express.js, MongoDB, and vanilla JavaScript. MiniShop provides a modern shopping experience with user authentication, product management, shopping cart, and order processing.

## 🚀 Features

### User Features
- **User Authentication**: Register, login, and secure session management with JWT
- **Product Browsing**: View products with search, filtering, and pagination
- **Shopping Cart**: Add/remove items, update quantities, and manage cart
- **Order Management**: Place orders with shipping address and track order status
- **Responsive Design**: Mobile-friendly interface with modern UI

### Admin Features
- **Product Management**: Add, edit, delete, and manage product inventory
- **Order Management**: View all orders and update order status
- **User Management**: Admin dashboard with full system control
- **Analytics**: Order tracking and inventory management

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with custom design
- **Vanilla JavaScript** - No frameworks, pure JS
- **Bootstrap 5** - UI components
- **Font Awesome** - Icons

## 📁 Project Structure

```
minishop/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seedData.js
│   ├── config.env
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── api.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── index.html
│   ├── login.html
│   ├── cart.html
│   ├── orders.html
│   ├── admin.html
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minishop
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies** (Optional - for development server)
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**
   ```bash
   cd ../backend
   cp config.env.example config.env
   ```
   
   Edit `config.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/minishop
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   ```

5. **Start MongoDB**
   - **Local MongoDB**: Start your local MongoDB service
   - **MongoDB Atlas**: Use your cloud connection string

6. **Seed Sample Data** (Optional)
   ```bash
   cd backend
   node seedData.js
   ```

7. **Start the Backend Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

8. **Start the Frontend Server**
   ```bash
   cd frontend
   # Using Python (if installed)
   python -m http.server 3000
   
   # Or using Node.js
   npx http-server -p 3000
   
   # Or simply open index.html in your browser
   ```

9. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📱 Usage

### Default Admin Account
- **Email**: admin@minishop.com
- **Password**: admin123

### Default User Accounts
- **Email**: john@example.com
- **Password**: user123
- **Email**: jane@example.com
- **Password**: user123

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

#### Products
- `GET /api/products` - Get all products (with pagination, search, filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

#### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:productId` - Update cart item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

#### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders/create` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `GET /api/orders/admin/all` - Get all orders (admin only)

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
The frontend is built with vanilla JavaScript, so you can:
- Edit HTML/CSS/JS files directly
- Use any web server (Python, Node.js, or browser)
- No build process required

### Database Schema

#### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date
}
```

#### Product Model
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  category: String (enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'other']),
  image: String (default placeholder),
  stock: Number (required),
  featured: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

#### Cart Model
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Model
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Customization

### Adding New Features
1. **Backend**: Add new routes in `backend/routes/`
2. **Frontend**: Add new JavaScript files in `frontend/js/`
3. **Styling**: Modify `frontend/css/style.css`

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Backend server port (default: 5000)

## 🚀 Deployment

### Backend Deployment
1. Set up a cloud server (AWS, DigitalOcean, Heroku, etc.)
2. Install Node.js and MongoDB
3. Clone the repository
4. Install dependencies: `npm install`
5. Set environment variables
6. Start the server: `npm start`

### Frontend Deployment
1. Upload frontend files to a web server
2. Update API base URL in `frontend/js/api.js`
3. Ensure CORS is properly configured in backend

### Production Considerations
- Change JWT secret to a secure random string
- Use environment variables for all sensitive data
- Enable HTTPS
- Set up proper error logging
- Use a production MongoDB instance
- Implement rate limiting
- Add input validation and sanitization

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `config.env`
   - Verify network connectivity

2. **CORS Issues**
   - Check CORS configuration in `backend/server.js`
   - Ensure frontend URL is whitelisted

3. **Authentication Issues**
   - Verify JWT secret is set
   - Check token expiration
   - Ensure proper headers in requests

4. **Port Conflicts**
   - Change PORT in `config.env` if 5000 is occupied
   - Update frontend API URL accordingly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔮 Future Enhancements

- Payment gateway integration
- Email notifications
- Advanced search and filters
- Product reviews and ratings
- Inventory management
- Analytics dashboard
- Mobile app development
- Multi-language support
- Advanced admin features

---

**Happy Shopping with MiniShop! 🛒**
#   M i n i S h o p - n o d e j s - m o n g o d b  
 #   M i n i S h o p - n o d e j s - m o n g o d b  
 #   M i n i S h o p - n o d e j s - m o n g o d b  
 