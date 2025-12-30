import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Counter from '../models/Counter.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akvora');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Counter.deleteMany({});
    console.log('Cleared existing data');

    // Create counter for AKVORA IDs
    const counter = new Counter({
      name: 'akvoraIdCounter',
      currentCount: 1000
    });
    await counter.save();
    console.log('Created counter');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      clerkId: 'admin_001',
      akvoraId: 'AKVORA:2025:1001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@akvora.com',
      password: hashedPassword,
      phone: '+1234567890',
      certificateName: 'Admin User',
      emailVerified: true,
      profileCompleted: true,
      role: 'admin',
      registeredYear: 2025
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create sample events
    const events = [
      {
        title: 'Web Development Bootcamp',
        description: 'Learn modern web development with React, Node.js, and MongoDB. This comprehensive bootcamp covers everything from basics to advanced concepts.',
        type: 'workshop',
        date: new Date('2025-02-15T09:00:00'),
        duration: '6 weeks',
        location: 'Online',
        isOnline: true,
        meetingLink: 'https://zoom.us/j/webdev-bootcamp',
        maxParticipants: 50,
        instructor: 'John Smith',
        instructorBio: 'Senior Full Stack Developer with 10+ years of experience',
        tags: ['web development', 'react', 'nodejs', 'mongodb'],
        requirements: ['Basic programming knowledge', 'Computer with internet access'],
        whatYouWillLearn: [
          'React fundamentals and advanced concepts',
          'Node.js and Express.js',
          'MongoDB database design',
          'RESTful API development',
          'Deployment strategies'
        ],
        price: 299,
        status: 'upcoming',
        createdBy: adminUser._id
      },
      {
        title: 'Data Science Internship Program',
        description: 'Hands-on internship program focusing on machine learning, data analysis, and AI technologies. Work on real-world projects.',
        type: 'internship',
        date: new Date('2025-03-01T10:00:00'),
        duration: '3 months',
        location: 'Tech Hub, San Francisco',
        isOnline: false,
        maxParticipants: 20,
        instructor: 'Dr. Sarah Johnson',
        instructorBio: 'PhD in Data Science, 15 years of research experience',
        tags: ['data science', 'machine learning', 'python', 'ai'],
        requirements: [
          'Python programming knowledge',
          'Statistics background',
          'Bachelor degree in STEM field'
        ],
        whatYouWillLearn: [
          'Machine learning algorithms',
          'Data preprocessing and cleaning',
          'Statistical analysis',
          'Deep learning fundamentals',
          'Project management skills'
        ],
        price: 0,
        status: 'upcoming',
        createdBy: adminUser._id
      },
      {
        title: 'Cloud Computing with AWS',
        description: 'Introduction to cloud computing and Amazon Web Services. Learn to deploy and manage applications in the cloud.',
        type: 'webinar',
        date: new Date('2025-01-20T14:00:00'),
        duration: '2 hours',
        location: 'Online',
        isOnline: true,
        meetingLink: 'https://zoom.us/j/aws-webinar',
        maxParticipants: 100,
        instructor: 'Mike Chen',
        instructorBio: 'AWS Certified Solutions Architect',
        tags: ['cloud computing', 'aws', 'devops'],
        requirements: ['Basic IT knowledge'],
        whatYouWillLearn: [
          'Cloud computing fundamentals',
          'AWS core services',
          'Deployment strategies',
          'Cost optimization',
          'Security best practices'
        ],
        price: 0,
        status: 'upcoming',
        createdBy: adminUser._id
      },
      {
        title: 'Mobile App Development Workshop',
        description: 'Learn to build cross-platform mobile applications using React Native. Create apps for both iOS and Android.',
        type: 'workshop',
        date: new Date('2025-02-01T10:00:00'),
        duration: '4 weeks',
        location: 'Online',
        isOnline: true,
        meetingLink: 'https://zoom.us/j/mobile-workshop',
        maxParticipants: 30,
        instructor: 'Emily Davis',
        instructorBio: 'Mobile Developer with 8 years of experience',
        tags: ['mobile development', 'react native', 'ios', 'android'],
        requirements: ['JavaScript knowledge', 'Basic React understanding'],
        whatYouWillLearn: [
          'React Native fundamentals',
          'Component development',
          'Navigation patterns',
          'State management',
          'App deployment'
        ],
        price: 199,
        status: 'upcoming',
        createdBy: adminUser._id
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Master the fundamentals of user interface and user experience design. Learn design thinking and modern design tools.',
        type: 'webinar',
        date: new Date('2025-01-25T16:00:00'),
        duration: '3 hours',
        location: 'Online',
        isOnline: true,
        meetingLink: 'https://zoom.us/j/uiux-webinar',
        maxParticipants: 75,
        instructor: 'Alex Rivera',
        instructorBio: 'Senior UI/UX Designer',
        tags: ['design', 'ui', 'ux', 'figma'],
        requirements: ['Creative mindset', 'Basic computer skills'],
        whatYouWillLearn: [
          'Design thinking process',
          'Color theory and typography',
          'User research methods',
          'Prototyping with Figma',
          'Design systems'
        ],
        price: 0,
        status: 'upcoming',
        createdBy: adminUser._id
      },
      {
        title: 'Cybersecurity Internship',
        description: 'Comprehensive internship program covering network security, ethical hacking, and security best practices.',
        type: 'internship',
        date: new Date('2025-03-15T09:00:00'),
        duration: '6 months',
        location: 'Security Operations Center, New York',
        isOnline: false,
        maxParticipants: 15,
        instructor: 'Robert Thompson',
        instructorBio: 'CISSP Certified Security Professional',
        tags: ['cybersecurity', 'network security', 'ethical hacking'],
        requirements: [
          'Networking fundamentals',
          'Linux knowledge',
          'Security awareness'
        ],
        whatYouWillLearn: [
          'Network security protocols',
          'Ethical hacking techniques',
          'Security audit processes',
          'Incident response',
          'Compliance frameworks'
        ],
        price: 0,
        status: 'upcoming',
        createdBy: adminUser._id
      }
    ];

    const createdEvents = await Event.insertMany(events);
    console.log(`Created ${createdEvents.length} events`);

    // Update counter
    await Counter.findOneAndUpdate(
      { name: 'akvoraIdCounter' },
      { $inc: { currentCount: 1 } }
    );

    console.log('Seed data created successfully!');
    console.log('Admin login: admin@akvora.com');
    console.log('Events created:', createdEvents.length);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedData();
