# CivicSolve AI

> **Statement 43:** *A Digital Platform to Crowdsource Societal Challenges and Facilitate Collaborative Problem Solving through Universities and Industry Partnerships.*

CivicSolve AI is an enterprise-grade, full-stack collaborative platform designed to bridge the critical gap between grassroots community challenges and institutional problem-solvers. The platform enables citizens, grassroots NGOs, and community advocates to submit real-world societal problems, while leveraging Google Gemini AI to structure inputs, detect semantic duplicates, match multidisciplinary university research laboratories, and mobilize industry CSR sponsorship.

---

## 🛡️ Agentic Threat Modeling & Security Architecture

In accordance with enterprise secure development directives and the **OWASP Top 10 for LLM Applications**, the platform implements defensive measures across all 5 threat zones:

| Threat Zone | Identified Vector | Countermeasure & Defensive Architecture |
|---|---|---|
| **1. Input Surfaces** | Malicious injection payloads, script tags in challenge descriptions, and oversized file payloads. | Strict input schema validation, defensive null-safe destructuring, text sanitization, and stripping of `undefined` values before persistence (`cleanPayload`). |
| **2. Planning & Reasoning** | Indirect prompt injection via user-submitted community problems attempting to hijack system instructions. | Untrusted inputs treated exclusively as structured data strings wrapped in deterministic delimiters, never as system instructions. Rigid JSON schema extraction via `@google/genai` Type Schema definitions. |
| **3. Tool Execution & AI** | Denial of Service (DoS) from token exhaustion, upstream API throttling, or quota exhaustion (`429`/`503`). | Resilient 4-tier model fallback ladder (`gemini-3.6-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest` ➔ `gemini-3.7-flash`) with automatic backoff and retry. |
| **4. Memory & State** | Cross-tenant data leakage, session hijacking, or unauthorized modification of project tasks. | Strict owner-bound document authorization paths (`request.auth.uid == userId`), role-based access checks, and isolated user interaction subcollections. |
| **5. Inter-System Communication** | Accidental API key exposure in client bundles or network logs. | Backend-for-Frontend (BFF) proxy pattern: Zero Gemini or Firebase secret keys sent to the client. All LLM orchestration executed server-side in Express. |

---

## 🚀 Cloud Run Deployment & Production Configuration

### 1. Prerequisites & GCP APIs

Ensure you have the Google Cloud SDK (`gcloud`) installed and authenticated:

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
gcloud config set project $PROJECT_ID

# Enable required GCP APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com
```

### 2. Secret Manager Configuration

Never commit API keys or service accounts to source control. Store secrets in Secret Manager and bind them directly to the Cloud Run service account:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Identify the project compute service account
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
export SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# 3. Grant Secret Accessor role to the Cloud Run service account
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Firestore Database & Security Rules

Provision Cloud Firestore in Native mode and deploy secure, owner-bound rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Isolated User Interactions Subcollection
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public challenges can be read by all authenticated users; only authors or admins can update
    match /challenges/{challengeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (
        request.auth.uid == resource.data.authorId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    // Projects & Solutions access control
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Deploy rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 4. Build and Deploy to Cloud Run

```bash
# Build container image and deploy service
gcloud run deploy civicsolve-ai \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-env-vars NODE_ENV=production,PORT=3000
```

### 5. Required Campaign Labeling

Apply the mandatory challenge label to register the service for automated verification:

```bash
gcloud run services update civicsolve-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=$REGION
```

---

## 🧪 Comprehensive Functional Verification Walkthrough

The following step-by-step test matrix verifies every user-facing flow:

### Flow 1: Interactive Persona Switching
1. Locate the top navigation bar.
2. Click on the active profile badge (`Citizen`, `Student`, `University Faculty`, `Industry CSR`, `Admin`).
3. Select **"IIT Bombay (University Faculty)"**.
4. Notice the header and permissions dynamically adapt to academic faculty with research grant actions.

### Flow 2: AI-Assisted Problem Submission Wizard
1. Click **"Submit Challenge"** in the top navigation.
2. **Step 1 (Basic Info)**: Enter a title (e.g., *"Groundwater Salinity and Drinking Water Scarcity"*), select category *"Water & Sanitation"*, urgency *"High"*, and region *"Maharashtra"*.
3. Click **"Run Gemini AI Structuring"**; observe the real-time AI generation of root causes, technical constraints, affected demographics, and measurable impact metrics.
4. **Step 2 (AI Duplicate & Similarity Check)**: Click **"Run AI Duplicate Check"** to detect existing similar challenges across the national database with match confidence scores.
5. **Step 3 (Matching Organizations)**: Click **"Find Partner Organizations"**; view recommended universities, research centers, and CSR sponsors with relevance explanations.
6. **Step 4 (Review & Publish)**: Click **"Submit Societal Challenge"**; confirm receipt of notification and immediate appearance in the live registry.

### Flow 3: Challenge Exploration & Natural Language AI Search
1. Navigate to **"Explore Challenges"**.
2. Type an informal conversational query into the search bar (e.g., *"clean drinking water for farming communities"*).
3. Click **"AI Semantic Search"** to let Gemini map the concept to thematic categories, urgency tags, and relevant regional challenges.
4. Filter by Domain, Status, and Location using the interactive filter pills.
5. Toggle **"Map View"** to inspect geo-located pins with priority color codes.

### Flow 4: Solution Proposal & Automated Multi-Criteria Evaluation
1. Click into any challenge (e.g., *"Fluoride Contamination in Shevgaon Drinking Water"*).
2. Read the structured diagnosis, required skills, and matched research partners.
3. In the Solutions section, click **"Propose Solution"**.
4. Fill in title, proposed technological approach, required budget, and timeline.
5. Click **"Evaluate with Gemini AI"**; view the comprehensive radar analysis across Feasibility, Scalability, Social Impact, Cost Effectiveness, and Sustainability, alongside strengths, weaknesses, and potential risk factors.
6. Submit the solution and observe upvote count and ranking.

### Flow 5: Collaborative Project Workspace & Kanban Execution
1. Navigate to the **"Workspace"** tab for an active pilot project.
2. **Kanban Tab**: Drag or transition tasks across *To Do*, *In Progress*, *Review*, and *Completed*.
3. **Milestones & Deliverables Tab**: Check off completed deliverables and observe dynamic progress recalculation.
4. **Gemini Project Assistant Tab**: Ask questions such as *"Generate a 2-week sprint plan for community water filtration testing"*.
5. Click the **"+ Add to Kanban"** button under any AI-suggested task to insert it into the team's live task backlog with a single click.

### Flow 6: Public Impact Telemetry & Analytics
1. Navigate to the **"Analytics"** dashboard.
2. Review real-time metrics: Total Challenges Submitted, Active Co-Development Pilots, Industry Funds Mobilized, and Citizen Lives Impacted.
3. Inspect interactive domain breakdowns, state-level density distributions, and university participation leaderboards.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend Service**: Node.js & Express API proxy with JSON body deserialization and defensive error handling.
- **AI Service Layer**: Google `@google/genai` TypeScript SDK with structured schema parsing and a multi-tier fallback ladder.
- **Database & Identity**: Google Cloud Firestore with owner-bound rules and Firebase Authentication.
- **Hosting & Infrastructure**: Google Cloud Run with Google Cloud Secret Manager integration.
