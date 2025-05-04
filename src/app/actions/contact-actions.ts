'use server';

import { z } from 'zod';

// Define a schema for form validation
const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type ContactFormInputs = z.infer<typeof ContactFormSchema>;

export async function submitContactForm(formData: ContactFormInputs) {
  try {
    // Validate input
    const result = ContactFormSchema.safeParse(formData);
    
    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors
      };
    }
    
    const validatedData = result.data;
    
    // In a real app: Process the form data server-side
    // 1. Save to database
    // await db.contactSubmissions.create(validatedData);
    
    // 2. Send email notification
    // await sendEmail({
    //   to: 'admin@example.com',
    //   subject: 'New Contact Form Submission',
    //   body: `Name: ${validatedData.name}\nEmail: ${validatedData.email}\nPhone: ${validatedData.phone || 'Not provided'}\n\nMessage: ${validatedData.message}`
    // });
    
    console.log('Contact form submitted:', validatedData);
    
    // 3. Return success response
    return {
      success: true,
      message: 'Your message has been sent successfully!'
    };
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    return {
      success: false,
      message: 'An error occurred while submitting the form. Please try again.'
    };
  }
} 