import { Link } from "react-router-dom";
import { LegalPage } from "../components/LegalPage";

export function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 7, 2026">
      <p>
        These terms apply to Macros Tracker, an independent project run by Make. By creating an account or using the
        app you agree to them. If you do not agree, please do not use the app.
      </p>

      <h2>The service</h2>
      <p>
        Macros Tracker lets you log meals, estimate nutrition from photos with AI, track daily calorie and macro
        targets, and read AI-written advice. The app is free and is provided as it is. It runs on free hosting, so it
        can be slow to start, change, or go offline without notice, and data can be lost. Export your data from time
        to time if it matters to you.
      </p>

      <h2>Not medical advice</h2>
      <p>
        Targets, estimates and advice in the app are general information. They are not medical, dietary or
        professional advice and do not replace a doctor or a registered dietitian. Calories and macros estimated from
        a photo are rough guesses and can be far off. Talk to a qualified professional before changing your diet if you
        are pregnant, have a medical condition, or have or may have an eating disorder. Do not use the app to make
        medical decisions.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be at least 16 years old.</li>
        <li>Give a real email address and keep your password to yourself. You are responsible for activity on your account.</li>
        <li>One person, one account.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>break the law or use the app to harm others;</li>
        <li>upload photos that are illegal, that you have no right to share, or that show other people without their consent;</li>
        <li>attack, overload, probe or reverse engineer the service, or bypass its limits;</li>
        <li>use bots or scripts to create accounts or to send large numbers of AI requests.</li>
      </ul>
      <p>
        The free demo on the home page needs no account but allows only a few tries per day from one network, and the
        demo and the other AI features have limits for the service as a whole. They may be unavailable when a limit is
        reached.
      </p>

      <h2>Your content</h2>
      <p>
        What you add stays yours. You give us permission to store it and process it, including by sending photos and
        diary summaries to our AI provider, only to run the app for you. How data is handled is described in the{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Ending your use</h2>
      <p>
        You can delete your account at any time from your profile. We may suspend or remove accounts that break these
        terms or put the service at risk, and we may end the service altogether.
      </p>

      <h2>No warranty and limited liability</h2>
      <p>
        The app is provided without warranties of any kind, including that it is accurate, always available or free
        of errors. To the extent the law allows, Make is not liable for any loss or damage that comes from using the
        app or from being unable to use it, including lost data and decisions made on the basis of AI estimates. Nothing
        in these terms limits rights you have under the law that cannot be limited.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated. The date at the top shows the latest version, and continuing to use the app after
        a change means you accept it.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be raised through the project&apos;s{" "}
        <a href="https://github.com/Myrrzec/kbju-tracker/issues" target="_blank" rel="noopener noreferrer">
          GitHub issues
        </a>
        . Issues there are public, so do not include personal data in them.
      </p>
    </LegalPage>
  );
}
