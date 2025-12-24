import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import './SignIn.css';

function SignUp() {
  return (
    <div className="sign-in-container">
      <div className="sign-in-box">
        <h1>Create your AKVORA account</h1>
        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/profile"
          afterSignInUrl="/profile"
          afterSignUpUrl="/profile"
        />
      </div>
    </div>
  );
}

export default SignUp;



