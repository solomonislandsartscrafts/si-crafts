# Requirements Document

## Introduction

Solomon Islands Arts Crafts (SI Crafts / SIAC) is a volunteer-run wholesale business that imports Solomon Islands handicrafts — pandanus weaving, wood carving, and shell-money jewellery — and sells them to Australian museum and gallery shops. This document specifies the requirements for the SI Crafts public website and wholesale platform.

The public site tells authentic maker stories and showcases products without pricing. Wholesale pricing and ordering are gated behind a stockist login. The hero feature is the "meet the maker" provenance flow: every product tag carries a QR/short URL that opens a mobile-first story page connecting the piece to its maker, craft technique, and place of origin.

The site is built phase-by-phase on mock data first (Phases 0–8), with real CMS integration documented but deferred to Phase 9.

## Glossary

- **Site**: The SI Crafts Next.js web application deployed to Cloudflare Pages
- **Public_Visitor**: Any unauthenticated user browsing the public site
- **Stockist**: An approved wholesale buyer (museum/gallery shop) with login credentials who can view pricing and place order requests
- **Admin**: A volunteer who manages site content; either a Super_Admin or an Editor
- **Super_Admin**: An Admin with full CRUD access to all collections plus ability to manage other Admins
- **Editor**: An Admin with content CRUD access only; cannot manage other Admins
- **Product**: A handicraft item with a unique product code, associated maker, material category, and product type
- **Product_Code**: A unique identifier following the pattern `{material_initial}-{maker_initial}-{number}` (e.g. "P-J-1" = pandanus item by Julie)
- **Maker**: A Solomon Islands artisan whose profile and products may be published on the site
- **Consent_Status**: A flag indicating whether a Maker has signed consent to be published on the web ("Signed" or "Not Signed")
- **Published_Flag**: A boolean flag controlled by Consent_Status; only Makers with Consent_Status = "Signed" have Published_Flag = true
- **Craft**: A technique category — pandanus weaving, wood carving, or shell-money jewellery
- **Material_Category**: The primary material grouping for products — pandanus, wood, or shells
- **Product_Type**: The functional category of a product — bags, jewellery, trays, fans, etc.
- **Provenance_Page**: The mobile-first story page at `/piece/{product-code}` linking a product to its maker, craft, and place
- **Order_Request**: A wholesale "expression of interest" submitted by a Stockist; paid by bank transfer, not card
- **GST_Threshold**: A$1,000 — the value above which a GST warning is displayed on a draft order
- **Service_Layer**: The `/src/services/*.ts` module that mediates all data access between pages/components and data sources
- **Mock_Data**: Typed TypeScript data in `/src/data/mock/` used during Phases 0–8 before real API integration
- **Cultural_Review_Flag**: A flag marking copy that describes cultural significance or traditional knowledge as "needs review" before publication

## Requirements

### Requirement 1: Project Foundation and Navigation

**User Story:** As a Public_Visitor, I want a responsive site with clear navigation, so that I can browse all sections on any device.

#### Acceptance Criteria

1. THE Site SHALL render a primary navigation bar containing exactly six links labelled: "Home", "Catalogue", "Meet the Makers", "About", "Wholesale", and "Contact", displayed in that order from left to right (or top to bottom when collapsed).
2. THE Site SHALL render a footer containing three content boxes labelled: "Crafts & Techniques", "Care Guide", and "FAQs & Shipping", each linking to its respective information page.
3. THE Site SHALL use a mobile-first responsive layout that reflows without horizontal scrolling at viewport widths of 320px, 375px, 768px, and 1280px, with no content overflow or truncation that hides information.
4. THE Site SHALL provide tap targets with a minimum dimension of 44×44 CSS pixels for all interactive elements, including navigation links, buttons, and footer links.
5. WHEN the viewport width is less than 768px, THE Site SHALL collapse the primary navigation into a hamburger menu button that is keyboard-focusable, has an accessible label of "Menu", and toggles a navigation panel listing all six links.
6. IF the hamburger menu is open and the user activates a navigation link or taps outside the menu panel, THEN THE Site SHALL close the hamburger menu panel.
7. THE Site SHALL be deployed as a Progressive Web App with a valid web app manifest (including name, short_name, start_url, display set to "standalone", and at least one icon of 192×192px and one of 512×512px) and an offline shell that renders the navigation and a "you are offline" message when the network is unavailable.
8. THE Site SHALL include Open Graph meta tags (og:title, og:description, og:image, og:url) on all public pages, where og:title is no longer than 60 characters and og:description is no longer than 155 characters.
9. WHEN the Site loads any page, THE Site SHALL render the primary navigation within 3 seconds on a simulated 4G connection (download 9 Mbps, upload 1.5 Mbps, 170ms RTT).

---

### Requirement 2: Data Model and Service Layer

**User Story:** As a developer, I want a typed data model with mock data accessed through a service layer, so that pages are decoupled from the data source and future CMS integration is seamless.

#### Acceptance Criteria

1. THE Service_Layer SHALL expose typed functions for retrieving Makers, Products, Crafts, Stockists, Admins, and Order_Requests, where each function returns data conforming to the TypeScript type definitions in `/src/types/`.
2. THE Service_Layer SHALL be the sole interface between pages/components and data sources; pages and components SHALL NOT import directly from Mock_Data files.
3. THE Mock_Data SHALL include at least 6 Makers (with at least 4 having consent status "Signed" and published flag true), 3 Crafts, and 18 Products, where every required field defined in the corresponding TypeScript type is populated with a non-empty value.
4. THE Mock_Data SHALL include at least 2 Stockist records (at least one with approval status "approved" and one "pending") and 2 Admin records (one Super_Admin, one Editor).
5. WHEN a service function for a single entity is called with an identifier that does not match any record, THE Service_Layer SHALL return `null` rather than throwing an error.
6. THE Site SHALL define Product_Code values following the pattern `{material_initial}-{maker_initial}-{sequential_integer}` for all Products, where each Product_Code is unique across the entire dataset.
7. WHEN filtering Products, THE Service_Layer SHALL combine multiple filter parameters (Material_Category, Product_Type, and Maker) using AND logic and SHALL return an empty array when no Products match the applied filters.
8. WHEN a text search is performed, THE Service_Layer SHALL match case-insensitively against Product name and description fields, returning all Products whose name or description contains the search term as a substring, and SHALL return an empty array when no Products match.
9. WHEN retrieving Makers for public-facing pages, THE Service_Layer SHALL return only Makers whose consent status is "Signed" AND whose published flag is true.
10. WHEN retrieving Products for public-facing pages, THE Service_Layer SHALL exclude Products linked to unpublished or non-consented Makers.

---

### Requirement 3: Public Home Page

**User Story:** As a Public_Visitor, I want a welcoming home page that introduces SI Crafts and the people behind the work, so that I understand the purpose and feel invited to explore.

#### Acceptance Criteria

1. THE Site SHALL display a hero section on the Home page with a featured image, a heading introducing Solomon Islands Arts Crafts, and introductory text (no more than 3 sentences) describing the business purpose.
2. THE Site SHALL display a curated selection of at least 3 and no more than 6 featured Products on the Home page, each showing name, photograph, material category, and Maker name, without any pricing information.
3. THE Site SHALL display a "Meet the Makers" preview section showing at least 2 Maker portrait cards (name, village, portrait) with a link to the Makers index page.
4. THE Site SHALL display a "Featured Crafts" section highlighting the three craft techniques with links to their respective /craft/{slug} pages.
5. THE Site SHALL display a call-to-action for wholesale enquiries linking to the Wholesale page.
6. THE Site SHALL display a "See an example tag" link that navigates to a sample Provenance_Page (/piece/{product-code}) demonstrating the QR scan-to-story experience.
7. WHEN a featured Product is displayed on the Home page, THE Site SHALL NOT display any pricing information including wholesale price, RRP, or price indicators.

---

### Requirement 4: About Pages

**User Story:** As a Public_Visitor, I want to learn about Solomon Islands, the SIAC team, and their mission, so that I can understand the context and values behind the business.

#### Acceptance Criteria

1. THE Site SHALL display an About page with three distinct navigable sections: "About Solomon Islands", "About the SIAC Team", and "Why We're Doing This", each identifiable by a visible heading.
2. THE "About Solomon Islands" section SHALL describe the country using the full name "Solomon Islands" and include at least one image placeholder depicting landscape or cultural context.
3. THE "About the SIAC Team" section SHALL introduce the volunteer team with individual names where available, avoiding generic descriptors.
4. THE "Why We're Doing This" section SHALL articulate the mission and purpose of SIAC.
5. THE Site SHALL use alternating text-and-imagery layout on the About page, with text blocks and images arranged in a two-column pattern on viewports 768px and above, and a single-column stack on smaller viewports.
6. WHEN copy describes cultural significance or traditional knowledge on the About page, THE Site SHALL flag that content with a Cultural_Review_Flag.

---

### Requirement 5: Catalogue — Public Product Browsing

**User Story:** As a Public_Visitor, I want to browse all products by material and product type without seeing prices, so that I can discover the range of crafts available.

#### Acceptance Criteria

1. THE Site SHALL display a Catalogue page listing all published Products grouped by Material_Category (pandanus, wood, shells) as the default view on page load.
2. THE Site SHALL provide a toggle control that switches the Product listing between grouping by Material_Category (pandanus, wood, shells) and grouping by Product_Type (bags, jewellery, trays, fans), preserving any active filter or search query when toggled.
3. THE Site SHALL provide a filter control allowing Public_Visitors to filter Products by Maker.
4. THE Site SHALL provide a search input (maximum 200 characters) allowing Public_Visitors to search Products by name or description.
5. IF a filter or search query returns zero matching Products, THEN THE Site SHALL display a message indicating no products match the current criteria and suggest clearing filters or adjusting the search.
6. IF the user is unauthenticated, THEN THE Site SHALL NOT display pricing information on any Catalogue page or Product detail page, and SHALL display a prompt indicating login is required to view wholesale pricing.
7. THE Site SHALL display each Product card with its name, product code, photograph (or a dignified placeholder image if no photograph is available), material category, product type, and associated Maker name.
8. WHEN a Public_Visitor selects a Product, THE Site SHALL navigate to the Provenance_Page at `/piece/{product-code}`.
9. THE Site SHALL only display Products whose associated Maker has Published_Flag set to true; Products linked to unpublished Makers SHALL NOT appear in the Catalogue or search results.
10. WHEN a Public_Visitor views the Product detail (Provenance_Page), THE Site SHALL display the product image gallery, product code, material category, product type, dimensions, care notes, and linked Maker name.

---

### Requirement 6: Makers Index and Detail Pages

**User Story:** As a Public_Visitor, I want to browse maker profiles and read their stories, so that I can learn about the people who create these crafts.

#### Acceptance Criteria

1. THE Site SHALL display a "Meet the Makers" index page listing all Makers whose Published_Flag is true, showing each Maker as a card containing their real name, village and province, primary Craft name, and portrait photograph, sorted alphabetically by Maker name.
2. THE Site SHALL NOT display any Maker whose Published_Flag is false on any public page, including index listings, detail pages, search results, and cross-links.
3. WHEN a Public_Visitor selects a Maker from the index, THE Site SHALL navigate to `/maker/{slug}`.
4. THE Site SHALL display on the Maker detail page: the Maker's real name, village and province, portrait photograph, first-person story, and a responsive grid of their Products where each Product item links to `/piece/{product-code}`.
5. THE Site SHALL use first-person voice for Maker stories.
6. THE Site SHALL never use generic or anonymising phrases that replace a maker's specific identity with a category label (e.g. "skilled artisan", "local craftsperson", "traditional maker") on Maker pages.
7. THE Site SHALL cross-link each Maker detail page to the relevant Craft technique page.
8. IF a Maker has no portrait photograph available, THEN THE Site SHALL display a neutral placeholder image that does not depict a person.
9. IF a Maker has zero published Products, THEN THE Site SHALL hide the Products grid section on that Maker's detail page and display no empty-state error.

---

### Requirement 7: Craft Technique Pages

**User Story:** As a Public_Visitor, I want to learn about the craft techniques (pandanus weaving, wood carving, shell-money jewellery), so that I understand the skill and tradition behind each product.

#### Acceptance Criteria

1. THE Site SHALL provide a Craft detail page at `/craft/{slug}` for each Craft: pandanus weaving, wood carving, and shell-money jewellery.
2. THE Site SHALL display on each Craft page: technique description (minimum 1 paragraph), process imagery (at least 1 image placeholder), and navigable links to Makers who practise that craft and whose Published_Flag is true and Consent status is "Signed".
3. THE Site SHALL cross-link each Craft page to Products of the corresponding Material_Category by displaying navigable links or cards that route the visitor to the relevant product detail pages.
4. WHEN copy on a Craft page describes cultural significance or ceremonial context, THE Site SHALL mark that content with a Cultural_Review_Flag attribute in the data layer, indicating it requires review by a Solomon Islands cultural partner before publication.
5. IF a Craft page has zero published Makers or zero Products for that Material_Category, THEN THE Site SHALL display the section with an informational message indicating no items are currently available, rather than hiding the section or showing an empty container.

---

### Requirement 8: Provenance "Meet the Maker" Hero Feature

**User Story:** As a Public_Visitor who has scanned a QR code on a product tag, I want to see the story of who made this piece, how it was made, and where it comes from, so that I have confidence in its provenance and a personal connection to the maker.

#### Acceptance Criteria

1. WHEN a Public_Visitor navigates to `/piece/{product-code}`, THE Site SHALL display the Provenance_Page for that Product.
2. THE Provenance_Page SHALL display five sections in order: (a) "This Piece" — Product name, photograph, product code, materials used, and care instructions; (b) "Your Maker" — Maker's name, portrait, village/province, and a first-person story excerpt of no more than 300 characters; (c) "The Craft" — craft technique name with a link to the full Craft page; (d) "The Place" — island/province name and cultural context of the craft's origin; (e) "Where to Buy" — a link to the Wholesale enquiry page.
3. THE Provenance_Page SHALL render without horizontal scroll and with tap targets of at least 44 px on viewports from 320 px wide upward.
4. THE Provenance_Page SHALL be publicly accessible without authentication.
5. IF the Product_Code in the URL does not match any Product, THEN THE Site SHALL display a "piece not found" message that includes a navigation link back to the Catalogue.
6. IF the Maker associated with a Product has Published_Flag = false, THEN THE Site SHALL NOT display the Maker's name, portrait, village, or story on the Provenance_Page; the page SHALL show the product information with a "maker details pending" message in place of the "Your Maker" section.
7. THE Provenance_Page SHALL load within 3 seconds on a simulated 3G connection (throughput capped at 1.6 Mbps, 300 ms RTT).
8. THE Site SHALL resolve the canonical URL `/piece/{product-code}` and support redirect from a shortened path (e.g. `/p/{product-code}`) so that QR codes printed on product tags reach the Provenance_Page.
9. IF the "The Place" section contains cultural-context text describing traditional knowledge or ceremonial significance, THEN THE Site SHALL display that text only when it has been marked as reviewed by a cultural partner; otherwise the section SHALL show the island/province name without cultural-context narrative.

---

### Requirement 9: Contact Page

**User Story:** As a Public_Visitor, I want to find contact details for SI Crafts, so that I can reach the team for enquiries.

#### Acceptance Criteria

1. THE Site SHALL display a Contact page with an email address for the SIAC team and a contact form collecting name, email, and message fields.
2. THE Site SHALL include a link to the Wholesale page for stockist enquiries on the Contact page.
3. WHEN a contact form is submitted with all required fields completed, THE Site SHALL display a confirmation message and store the submission via the Service_Layer.
4. IF a contact form is submitted with missing or invalid fields, THEN THE Site SHALL display inline validation errors indicating which fields need correction.

---

### Requirement 10: Wholesale Public Explainer

**User Story:** As a potential Stockist, I want to understand how wholesale ordering works before logging in, so that I know what to expect and how to apply.

#### Acceptance Criteria

1. THE Site SHALL display a Wholesale page explaining the wholesale ordering process, minimum order information, and bank transfer payment method without displaying any product pricing.
2. THE Site SHALL include a clearly labelled login button or link for existing Stockists to access the gated wholesale area.
3. THE Site SHALL include an "Apply to become a stockist" link or button on the Wholesale page that navigates to the Stockist application form.
4. THE Site SHALL NOT display any pricing (wholesale or retail) on the public Wholesale explainer page.
5. THE Wholesale page SHALL clearly state that orders are expressions of interest paid by bank transfer, not confirmed purchases.

---

### Requirement 11: Stockist Authentication

**User Story:** As a Stockist, I want to log in securely, so that I can access wholesale pricing and place order requests.

#### Acceptance Criteria

1. WHEN a Stockist submits an email and password that match a registered stockist account, THE Site SHALL authenticate the Stockist, create a session, and redirect to the gated wholesale area.
2. IF a Stockist submits credentials where the email does not match a registered account OR the password is incorrect, THEN THE Site SHALL display a single generic error message indicating that the credentials are invalid, without revealing which field was wrong.
3. WHILE a Stockist is authenticated, THE Site SHALL display wholesale pricing on Product detail pages and provide access to the downloadable price list within the gated area.
4. WHEN a Stockist activates the logout action, THE Site SHALL destroy the active session, revoke access to the gated wholesale area, and redirect to the public Wholesale page.
5. THE Site SHALL persist Stockist sessions using secure, HTTP-only session tokens that expire after 8 hours of inactivity, and the session SHALL remain valid across page navigations within the gated area until expiry or explicit logout.
6. IF an unauthenticated user attempts to access any page within the gated wholesale area, THEN THE Site SHALL redirect the user to the Stockist login page without exposing any wholesale pricing or order functionality.

---

### Requirement 12: Stockist Application

**User Story:** As a potential Stockist, I want to apply for a wholesale account, so that I can be approved to view pricing and place orders.

#### Acceptance Criteria

1. THE Site SHALL provide a Stockist application form collecting: business name (required), ABN (required, validated as 11 digits), contact name (required), email (required, validated format), phone (required), and a short description of the business (required, maximum 500 characters).
2. WHEN a Stockist application is submitted with all required fields valid, THE Site SHALL store it with a "pending" status for Admin review via the Service_Layer.
3. WHEN a Stockist application is submitted successfully, THE Site SHALL display a confirmation message indicating the application has been received and will be reviewed.
4. IF a Stockist application form is submitted with missing or invalid fields, THEN THE Site SHALL display inline validation errors for each invalid field and prevent submission.

---

### Requirement 13: Wholesale Ordering

**User Story:** As an authenticated Stockist, I want to build a wholesale order request and submit it, so that I can express interest in purchasing products at wholesale prices.

#### Acceptance Criteria

1. WHILE a Stockist is authenticated, THE Site SHALL allow the Stockist to add Products to a draft Order_Request, adjust the quantity of any line item (minimum 1, maximum 999), and remove line items from the draft.
2. WHILE a draft Order_Request contains at least one line item, THE Site SHALL display the running total in AUD to two decimal places (excluding GST), updating within 1 second of any quantity or line-item change.
3. WHEN the draft Order_Request total exceeds A$1,000, THE Site SHALL display a persistent GST threshold warning banner indicating that GST registration obligations may apply at this value.
4. WHEN a Stockist submits an Order_Request, THE Site SHALL store it via the Service_Layer and display a confirmation page showing a unique reference number and the submission timestamp.
5. WHILE a Stockist is authenticated, THE Site SHALL provide an Order History page listing all past Order_Requests for that Stockist, sorted by date descending, showing for each entry: reference number, submission date, and status (one of: Submitted, Confirmed, or Shipped).
6. THE Site SHALL display a visible notice on the Order_Request review page and on the confirmation page stating that Order_Requests are expressions of interest paid by bank transfer and are not confirmed purchases.
7. WHILE a Stockist is authenticated, THE Site SHALL persist the draft Order_Request locally so that it survives page navigation and page refresh until the Stockist submits or explicitly clears the draft.

---

### Requirement 14: Footer Information Pages

**User Story:** As a Public_Visitor, I want to access care guides, FAQs, and shipping information, so that I understand how to care for products and how delivery works.

#### Acceptance Criteria

1. THE Site SHALL display a persistent footer section on every page containing navigational links to the "Crafts & Techniques", "Care Guide", and "FAQs & Shipping" pages.
2. THE Site SHALL provide a "Crafts & Techniques" footer page that displays, for each of the three craft categories (shell-money jewellery, pandanus weaving, wood carving), a category name, a description of no more than two sentences, a representative image, and a link to that category's detail page.
3. THE Site SHALL provide a "Care Guide" footer page with a dedicated care-instruction section for each material type (pandanus, wood, shell), each section containing at least three actionable maintenance recommendations.
4. THE Site SHALL provide a "FAQs & Shipping" footer page containing at minimum four question-and-answer entries that address ordering process, delivery/shipping, returns policy, and a "Do you provide retail sales?" entry whose answer states that SIAC is wholesale only and directs retail shoppers to view stocking retailers.
5. WHEN a Public_Visitor navigates to any footer information page, THE Site SHALL render the page content without requiring login or authentication.

---

### Requirement 15: Admin Authentication and Role Gating

**User Story:** As an Admin, I want to log in and access a dashboard appropriate to my role, so that I can manage site content securely.

#### Acceptance Criteria

1. WHEN an Admin submits valid credentials (registered email and matching password) on the /admin login page, THE Site SHALL authenticate the Admin, create a session, and redirect to the Admin dashboard within 2 seconds.
2. IF an Admin submits invalid credentials, THEN THE Site SHALL display a generic error message indicating that the email or password is incorrect without revealing which field failed validation.
3. IF an Admin fails authentication 5 consecutive times for the same email address, THEN THE Site SHALL lock that account for 15 minutes and display a message indicating the account is temporarily locked.
4. WHILE a Super_Admin session is active, THE Site SHALL grant access to all CRUD operations on Products, Makers, Crafts, Stockists, and Orders collections, plus the ability to create, edit, and delete other Admin accounts.
5. WHILE an Editor session is active, THE Site SHALL grant access to CRUD operations on Products, Makers, Crafts, and Orders collections only; Admin account management controls SHALL NOT be rendered or accessible via direct URL.
6. IF an Editor attempts to access Admin management functions (via UI or direct URL), THEN THE Site SHALL deny the request, return the Editor to the Admin dashboard, and display an "insufficient permissions" message.
7. IF a non-Admin user (including Stockists and unauthenticated visitors) requests any /admin route, THEN THE Site SHALL deny access and redirect to the public home page without revealing that an admin area exists.
8. IF an Admin session has been inactive for 60 minutes or has exceeded 24 hours total duration, THEN THE Site SHALL invalidate the session and redirect the Admin to the /admin login page with a message indicating the session has expired.

---

### Requirement 16: Admin Content Management

**User Story:** As an Admin, I want to create, read, update, and delete content for makers, products, crafts, and pages, so that the site stays current.

#### Acceptance Criteria

1. WHILE an Admin is authenticated, THE Site SHALL provide create, read, update, and delete interfaces for: Makers, Products, Crafts, Stockists, and Order_Requests, with all data operations routed through the service layer.
2. THE Admin dashboard SHALL display the Consent_Status and Published_Flag for each Maker record in the Makers list view.
3. WHEN an Admin sets a Maker's Consent_Status to "Signed", THE Site SHALL set the Published_Flag to true, making the Maker and their associated Products visible on public pages.
4. WHEN an Admin sets a Maker's Consent_Status to "Not Signed", THE Site SHALL set the Published_Flag to false, removing the Maker and all Products linked to that Maker from public pages.
5. THE Admin dashboard SHALL provide media upload functionality accepting JPEG, PNG, and WebP files up to 5 MB per file for product photographs, maker portraits, and craft process photos.
6. THE Admin dashboard SHALL provide a Cultural_Review_Flag toggle on content fields describing cultural significance, traditional knowledge, or ceremonial context, so that Admins manually mark copy requiring cultural-partner review before publication.
7. WHEN an Admin creates or edits a Product, THE Site SHALL validate that the Product_Code follows the `{material_initial}-{maker_initial}-{number}` pattern where material_initial is one of P, W, or S, maker_initial is one or more uppercase letters, and number is a positive integer.
8. IF Product_Code validation fails during Product create or edit, THEN THE Site SHALL display an inline error message indicating the expected format and prevent the record from being saved.
9. WHEN an Admin initiates a delete action on any record, THE Site SHALL display a confirmation dialog requiring explicit approval before executing the deletion.
10. WHILE an Admin is authenticated, THE Site SHALL provide an interface to approve or reject Stockist applications, updating the Stockist's account status accordingly.

---

### Requirement 17: Admin Management (Super Admin Only)

**User Story:** As a Super_Admin, I want to manage other Admin accounts, so that I can control who has access to the content management system.

#### Acceptance Criteria

1. WHEN a Super_Admin is authenticated, THE Site SHALL provide an Admin management interface to list, create, edit, and deactivate Admin accounts.
2. THE Admin management interface SHALL allow a Super_Admin to assign roles (Super_Admin or Editor) to Admin accounts.
3. IF an Editor attempts to access the Admin management interface, THEN THE Site SHALL deny access and display the standard unauthorised-access message.
4. IF a Super_Admin attempts to deactivate their own account, THEN THE Site SHALL reject the action and display an error message indicating that self-deactivation is not permitted, preserving the account's current state.
5. IF a requested role change or deactivation would result in zero active Super_Admin accounts, THEN THE Site SHALL reject the action and display an error message indicating that at least one active Super_Admin must exist at all times.

---

### Requirement 18: Cultural Guardrails Enforcement

**User Story:** As a site operator, I want the system to enforce cultural guardrails, so that maker consent and cultural sensitivity are always respected.

#### Acceptance Criteria

1. THE Site SHALL NOT display any Maker with Published_Flag = false on any public page, Provenance Page, Catalogue listing, search result, or public-facing API response.
2. THE Site SHALL use real maker names and real village/province names wherever Maker information appears (Maker detail pages, Maker cards, Provenance Pages, catalogue listings, and search results); generic terms such as "skilled artisan" or "traditional community" SHALL NOT be used.
3. THE Site SHALL present Maker stories in first-person voice (using first-person pronouns such as "I", "my", "we", "our").
4. THE Site SHALL associate a Cultural_Review_Flag with all copy describing cultural significance, traditional knowledge, or ceremonial context; content carrying an unreviewed Cultural_Review_Flag SHALL NOT be displayed on any public page until the flag is marked as reviewed.
5. THE Site SHALL use "Solomon Islands" as the country name in all user-visible text; abbreviations such as "the Solomons" SHALL NOT be used.
6. IF a Maker's story content is unavailable (null, empty, or whitespace-only), THEN THE Site SHALL display a "pending cultural review" placeholder rather than generated or invented content.
7. IF a Maker's Published_Flag changes from true to false, THEN THE Site SHALL remove that Maker from all public pages, Provenance Pages, catalogue listings, search results, and public-facing API responses within the same page render or data fetch (no stale cache serving the removed Maker).
8. WHEN new Maker content is created, THE Site SHALL set the Cultural_Review_Flag to "unreviewed" by default until an Admin explicitly marks it as reviewed.

---

### Requirement 19: Accessibility

**User Story:** As a Public_Visitor using assistive technology, I want the site to be accessible, so that I can browse content regardless of ability.

#### Acceptance Criteria

1. THE Site SHALL achieve WCAG 2.1 Level AA compliance on all public pages, verified by zero critical or serious violations reported by an automated accessibility audit tool.
2. THE Site SHALL provide alt text for all product and maker images that includes the product name or maker name and the craft type (e.g. "Pandanus basket by Julie"), and SHALL mark purely decorative images with an empty alt attribute so they are hidden from screen readers.
3. THE Site SHALL support keyboard navigation for all interactive elements — including the hamburger menu, filters, and forms — such that every element is reachable via Tab, activatable via Enter or Space, and dismissable (where applicable) via Escape; and SHALL display a visible focus indicator with a minimum 2 px outline on every focusable element.
4. THE Site SHALL maintain a minimum colour contrast ratio of 4.5:1 for body text and 3:1 for large text (18 px or above, or 14 px bold or above).
5. THE Site SHALL use semantic HTML landmarks (header, nav, main, footer) on all pages and SHALL provide a skip-navigation link as the first focusable element that moves focus directly to the main content region.
6. THE Site SHALL announce dynamic content changes (such as filter result counts and form validation errors) to screen readers using ARIA live regions with `aria-live="polite"` for non-urgent updates and `aria-live="assertive"` for error messages that require immediate attention.
7. WHEN the hamburger menu or any modal dialog is opened via keyboard, THE Site SHALL trap focus within that element until it is closed, and SHALL return focus to the triggering element upon dismissal.
8. THE Site SHALL associate every form input with a visible `<label>` element, and SHALL programmatically link error messages to their corresponding input using `aria-describedby`.

---

### Requirement 20: Performance and Technical Quality

**User Story:** As a Public_Visitor, I want the site to load quickly and work reliably, so that I have a smooth browsing experience.

#### Acceptance Criteria

1. THE Site SHALL achieve a Lighthouse Performance score of 90 or above on each public page when tested using Lighthouse mobile emulation (Moto G Power, simulated 4G throttling).
2. THE Site SHALL use `next/image` for responsive, optimised image delivery on all pages.
3. IF the user's system has `prefers-reduced-motion: reduce` enabled, THEN THE Site SHALL disable all Framer Motion animations (duration set to 0, no visual motion).
4. THE Site SHALL use Tailwind CSS breakpoints for responsive layout with no custom media queries.
5. THE Site SHALL pre-render all public pages as static pages at build time, excluding only pages that require per-request authentication state or session-dependent data.
6. THE Site SHALL be deployable to Cloudflare Pages with no server-side runtime dependency beyond edge functions for authentication.
7. WHEN a visitor loads a provenance page (`/piece/*`) on a simulated 3G connection (1.6 Mbps download, 750 ms RTT), THE Site SHALL complete page load (Largest Contentful Paint) within 3 seconds.
8. THE Site SHALL be installable as a Progressive Web App and serve a cached offline shell page when the device has no network connectivity.
9. THE Site SHALL include Open Graph meta tags (og:title, og:description, og:image, og:url) on every public page.

---

### Requirement 21: Wagtail CMS Integration Preparation

**User Story:** As a developer, I want documentation describing how to replace mock data with Wagtail API calls, so that future CMS integration is straightforward.

#### Acceptance Criteria

1. THE Site SHALL include a README document (Phase 9) that lists every service function in `/src/services/`, and for each function provides: the function name, the corresponding Wagtail REST API endpoint path, the HTTP method, the request parameters, and the expected response shape (field names and types).
2. THE README SHALL document the expected Wagtail content models for Makers, Products, Crafts, Stockists, and Order_Requests, where each model entry includes the model name, its field names and field types, and its relationships to other models.
3. THE README SHALL document authentication integration covering: the login flow between the Next.js front end and Wagtail's user system, token or session handling mechanism, session persistence approach, and role mapping for Stockist and Admin user types.
4. THE Service_Layer SHALL be structured so that replacing mock data imports with API fetch calls requires changes only within `/src/services/` files, with no modifications to any page or component file imports or props.
5. THE README SHALL include sections documenting: the Cloudflare Pages deployment plan for the Next.js front end, where SEO meta tags, Open Graph tags, PWA configuration, and Priority Hints are managed post-integration, where real authentication and payment handling plug in, and which admin dashboard screens map to native Wagtail admin versus custom views.

---

### Requirement 22: Design Direction and Visual Identity

**User Story:** As a Public_Visitor, I want the site to feel warm, personal, and culturally respectful, so that the visual experience matches the stories being told.

#### Acceptance Criteria

1. THE Site SHALL use an earthy colour palette defined as design tokens in `/src/theme/`, including: warm neutrals (sand, terracotta), ocean blues (deep blue, teal), and generous white space, with each colour having defined HEX values and semantic names.
2. THE Site SHALL use clean, readable typography with a minimum body font size of 16px, line-height of at least 1.5 for body text, and heading fonts that provide visual presence without being decorative or ornamental.
3. THE Site SHALL alternate text and imagery in a two-column storytelling layout on viewports 768px and above, collapsing to a single-column stack on smaller viewports, with photography as the visual lead.
4. THE Site SHALL use a responsive grid layout for index pages (Makers, Products) with consistent card sizing that reflows from 1 column (mobile) to 2 columns (tablet) to 3-4 columns (desktop).
5. THE Site SHALL maintain generous white space (minimum 24px between content sections) and an uncluttered visual hierarchy across all pages.
6. THE Site SHALL use Lucide icons consistently for UI affordances (navigation, actions, status indicators) at a minimum touch size of 44px when used as interactive elements.
