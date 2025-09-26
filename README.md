# CV Management System - Al-Qaeid Recruitment Template

A comprehensive CV management system specifically designed for Al-Qaeid Recruitment Company, supporting both simple and comprehensive CV templates with advanced features.

## 🚀 Features

### Core Functionality
- **Dual Template System**: Simple and comprehensive CV templates
- **Multi-language Support**: Arabic and English interface
- **PDF Export**: Professional PDF generation matching company templates
- **Excel Import/Export**: Bulk CV import from Excel files
- **Image Upload**: Profile picture support with optimization
- **User Management**: Role-based access control (Admin, Sub-Admin, User)

### Al-Qaeid Comprehensive Template
- **40+ Data Fields**: Complete support for all company form fields
- **Professional Layout**: Matches 100% of the original company template
- **Skills Management**: 10 core skills with YES/NO/WILLING status
- **Experience Tracking**: Dynamic previous employment history
- **Language Proficiency**: Arabic and English skill levels
- **Personal Details**: Comprehensive personal and passport information

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with React 19
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS 4.0
- **PDF Generation**: Puppeteer
- **File Processing**: XLSX for Excel handling
- **Image Processing**: HTML2Canvas
- **UI Components**: Radix UI primitives

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Service Account (for Google Sheets integration - optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd cv-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Random secret for NextAuth

Optional (for Google Sheets integration):
- `GOOGLE_SHEETS_ID`: Google Sheets ID
- `GOOGLE_CLIENT_EMAIL`: Service account email
- `GOOGLE_PRIVATE_KEY`: Service account private key

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 👥 Default Login Credentials

```
Admin: admin@cvmanagement.com / admin123
Sub-Admin: subadmin@cvmanagement.com / subadmin123
User: user@cvmanagement.com / user123
```

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Reusable components
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript definitions
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
│   └── uploads/             # User uploaded files
├── scripts/                 # Build and utility scripts
└── docs/                    # Documentation files
```

## 🔧 Key Features Guide

### Adding CVs
1. **Simple Template**: Basic CV information
2. **Al-Qaeid Template**: Comprehensive 40+ field form

### Excel Import
1. Download the Excel template
2. Fill in CV data following the template structure
3. Upload via the import interface
4. Review import results and handle any errors

### PDF Export
- **Simple Template**: Clean, minimal design
- **Al-Qaeid Template**: Professional company-branded layout

### User Management
- **Admin**: Full system access
- **Sub-Admin**: CV management without user administration
- **User**: View and basic CV operations

## 🌐 Deployment

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📊 Database Schema

Key models:
- **User**: Authentication and role management
- **CV**: Comprehensive CV data storage
- **Session**: NextAuth session management

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- File upload validation
- SQL injection protection
- Role-based access control

## 🌍 Internationalization

- Arabic and English interface
- RTL/LTR layout support
- Localized date formatting
- Multi-language PDF export

## 📈 Performance

- Server-side rendering with Next.js
- Image optimization
- Database query optimization
- Efficient PDF generation
- Responsive design for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software developed for Al-Qaeid Recruitment Company.

## 🆘 Support

For technical support or questions:
- Check the documentation in `/docs`
- Review the Arabic README (`README-ALQAEID.md`)
- Contact the development team

## 🔄 Version History

- **v1.5**: Al-Qaeid comprehensive template integration
- **v1.0**: Initial release with basic CV management

---

**Status**: ✅ Production Ready - Fully supports all Al-Qaeid Recruitment requirements
