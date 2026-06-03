import { SignUp } from "@clerk/nextjs";

const Page = () => {
  return (
    <SignUp 
      forceRedirectUrl="/sign_up_callback"
      afterSignUpUrl="/sign_up_callback"
    />
  );
};

export default Page;