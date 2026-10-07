import { LegalPage } from "../components/LegalPage";

export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 7, 2026">
      <p>
        Macros Tracker is a calorie and macro tracking app run by Make as an independent project. This page explains
        what data the app handles, why, who else sees it, and how you can remove it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account:</strong> your email address and a password. The password is stored only as a salted bcrypt
          hash, so it cannot be read back.
        </li>
        <li>
          <strong>Profile (all optional):</strong> name, sex, date of birth, height, weight, activity level, goal and
          any daily targets you set by hand. This is health-related information, so please share only what you are
          comfortable with. The app works with a partly filled profile, but daily targets need enough of it to be
          calculated.
        </li>
        <li>
          <strong>Diary:</strong> what you log (dish name, portion in grams, calories, protein, fat, carbs), the meal
          type, the time, and whether the entry came from a photo.
        </li>
        <li>
          <strong>Photos:</strong> pictures of meals you upload for analysis. A photo you analyze in the free demo on
          the home page, without an account, is not saved at all.
        </li>
        <li>
          <strong>Advice:</strong> the text of the AI advice generated for you.
        </li>
        <li>
          <strong>Technical data:</strong> your IP address and basic request details appear in server logs and are used
          to limit abuse, including the number of free demo tries per day. Your browser sends its time zone so that each day in your diary starts and ends at your
          local midnight.
        </li>
      </ul>

      <h2>Cookies and tracking</h2>
      <p>
        The app keeps your sign-in tokens in your browser&apos;s local storage so you stay signed in. It does not use
        advertising cookies, analytics or tracking scripts, and it does not sell your data.
      </p>

      <h2>How we use it</h2>
      <p>
        Only to run the app: to sign you in, calculate your daily targets, show your diary, analyze meal photos,
        write advice, and protect the service from abuse.
      </p>

      <h2>AI processing</h2>
      <p>
        Two features send data to Anthropic, the company behind the Claude models, through its API:
      </p>
      <ul>
        <li>
          <strong>Photo analysis.</strong> When you press Analyze photo, with or without an account, the picture is
          sent to Claude to estimate the dishes, portions and nutrition.
        </li>
        <li>
          <strong>Advice.</strong> When you press Refresh advice, Claude receives your sex, height, weight, activity
          level, goal, your daily targets and your daily calorie and macro totals for the last few days. Your email,
          name and date of birth are not sent.
        </li>
      </ul>
      <p>
        Anthropic handles this data under its own terms and privacy policy, available at{" "}
        <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer">
          anthropic.com/legal/privacy
        </a>
        . AI results are estimates and can be wrong.
      </p>

      <h2>Who else handles your data</h2>
      <ul>
        <li>
          <strong>Cloudflare</strong> serves the website files.
        </li>
        <li>
          <strong>Render</strong> runs the API and the PostgreSQL database that stores your account, profile, diary and
          advice.
        </li>
        <li>
          <strong>Anthropic</strong> processes photos and advice requests as described above.
        </li>
      </ul>
      <p>
        These providers may run servers outside your country, so your data can be transferred across borders. We
        share data with no one else, except where the law requires it.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Your data stays until you delete it. Deleting a diary entry removes it, and removes its photo once no other
        entry uses that photo. Deleting your account removes your account, profile, diary, advice and photos from the
        live system right away.
      </p>
      <p>
        Photo files live on temporary server storage that is cleared whenever the server restarts or is redeployed.
        A photo you analyze but never save to your diary is not linked to your account and disappears at the next
        restart.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          <strong>See and export:</strong> Profile, then Your data, then Download my data. You get a JSON file with
          your account, profile, diary entries and advice. Photo files are not included.
        </li>
        <li>
          <strong>Correct:</strong> edit your profile and any diary entry in the app.
        </li>
        <li>
          <strong>Delete:</strong> Profile, then Your data, then Delete account. You will be asked for your password.
          This cannot be undone.
        </li>
      </ul>
      <p>
        Depending on where you live, you may have further rights, including lodging a complaint with your local data
        protection authority.
      </p>

      <h2>Security</h2>
      <p>
        Traffic is encrypted with HTTPS, passwords are hashed, and sign-in and AI features have rate limits. No online
        service is perfectly secure, so use a password you do not use anywhere else.
      </p>

      <h2>Children</h2>
      <p>The app is not meant for people under 16. Please do not create an account if you are younger.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a meaningful way, the date at the top will change. Continuing to use the app after
        that means you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent through the project&apos;s{" "}
        <a href="https://github.com/Myrrzec/kbju-tracker/issues" target="_blank" rel="noopener noreferrer">
          GitHub issues
        </a>
        . Issues there are public, so do not include personal data in them.
      </p>
    </LegalPage>
  );
}
