# Cohort Problem Statement Research

## Recommendation

Offer ten curated problems plus a bring-your-own route. Each option should be familiar enough to understand without domain training, narrow enough for a first-week MVP, and capable of gaining a meaningful RAG layer, agent workflow and evaluation layer during the following weeks.

The recommended options are:

1. **Intelligent Food & Pantry Optimisation** — reduce household food waste through ingredient-aware meal planning.
2. **Meeting-to-Execution Intelligence** — turn meeting material into reviewable decisions and actions.
3. **Adaptive Learning & Study Orchestration** — help students plan and learn from their own course material.
4. **Evidence Discovery & Research Synthesis** — help students and researchers organise and inspect papers.
5. **Personal Administration & Renewal Intelligence** — find obligations, costs and dates hidden in household documents.
6. **Household Energy Intelligence & Optimisation** — turn confusing usage data into realistic household action.
7. **Family Care Coordination & Continuity** — organise non-clinical care information across a family.
8. **Customer Signal & Product Intelligence** — turn scattered customer feedback into traceable product evidence.
9. **Public Service & Benefits Navigation** — explain official guidance and prepare an application checklist.
10. **Inbox-to-Action Intelligence** — separate requests, deadlines and decisions from communication noise.

Learners may instead bring a problem they understand first-hand. It should have a reachable user, an observable current workflow and a small outcome that can be tested within four weeks.

These are problem directions, not fixed product specifications. Learners should interview or observe at least one likely user during Week 0 and narrow the problem before building.

## Selection criteria

Every option was assessed against six course requirements:

- The problem is recognisable from ordinary life, education or work.
- A useful Week 1 version can be built as a simple input-to-output workflow.
- RAG adds real value in Week 2 rather than being attached artificially.
- A controlled tool-using workflow adds real value in Week 3.
- Quality can be measured with a small evaluation set in Week 4.
- The learner can demonstrate the product using non-sensitive or synthetic data.

The evidence below establishes that the underlying problems are real. It does not prove that a particular app concept will succeed; learner research in Week 0 still matters.

## 1. Intelligent Food & Pantry Optimisation

### Problem

People buy food with good intentions but lose track of what they already have, what needs using first and what meals fit their time and preferences. The product should help a household use ingredients and leftovers, plan a few realistic meals and draft a shopping list. It should not provide medical nutrition advice or claim to manage health conditions.

### Evidence

UNEP estimates that 1.05 billion tonnes of food were wasted at retail, food-service and household level in 2022, with households responsible for 631 million tonnes, or 60% of that total.[^1] A systematic review of 42 primary studies identifies leftover management, meal planning and food-preparation skills as important targets for household food-waste interventions.[^2]

The opportunity is therefore more specific than “build a recipe chatbot.” The useful behaviour is helping someone make a decision from the food they actually have, while respecting their time, preferences and uncertainty about ingredients.

### Four-week fit

- **Week 1:** User types ingredients, time and preferences; the app suggests a small meal plan.
- **Week 2:** Suggestions are grounded in a curated recipe collection and return recipe sources.
- **Week 3:** A workflow checks the pantry list, proposes meals and drafts a shopping list for approval.
- **Week 4:** Evaluate ingredient coverage, constraint-following, unsupported claims, latency and cost.

### Important constraint

Keep the product about planning, convenience and waste. Allergies can be treated as strict exclusion constraints, but the app should not prescribe diets or replace a qualified health professional.

## 2. Meeting-to-Execution Intelligence

### Problem

Teams leave meetings with decisions and actions spread across transcripts, notes and chat. Owners, dates and supporting context may be missing or ambiguous. The product should turn meeting material into a reviewable follow-up, not silently create tasks or invent commitments.

### Evidence

In a Microsoft survey of 18,100 workers across 12 markets, more than a third said they had too many meetings and that most were inefficient. Respondents also strongly valued clear goals, accessible meeting information and support for administrative tasks such as note-taking.[^3] A CHI 2024 study describes inefficient meetings and lack of clear goals as leading productivity obstacles and finds that existing meeting technology gives limited support for goal-directed behaviour.[^4]

This makes the strongest beginner scope a “decision and action checkpoint,” rather than another generic summariser. The human should be able to verify the transcript evidence, edit owners and dates, and approve anything sent to another system.

### Four-week fit

- **Week 1:** Paste meeting notes and extract decisions, actions, owners and dates.
- **Week 2:** Retrieve project briefs, earlier decisions and role information to explain context.
- **Week 3:** Draft project tasks or follow-up messages, with explicit human approval before creation.
- **Week 4:** Measure missed actions, invented actions, incorrect owners or dates, latency and cost.

### Important constraint

Use synthetic meeting notes during the cohort unless participants have explicit permission to process real workplace material. No task, email or calendar event should be created without review.

## 3. Adaptive Learning & Study Orchestration

### Problem

Students have deadlines, notes and course resources in different places, but still have to decide what to study, when to do it and whether they understand it. The product should support planning, retrieval practice and reflection—not complete assessed work for the learner.

### Evidence

OECD analysis of PISA 2022 data identifies planning schoolwork, finding resources, maintaining motivation and assessing progress as central self-directed learning behaviours. It also reports positive relationships between proactive study behaviour and confidence in directing one’s own learning.[^5] The Education Endowment Foundation’s evidence review examines how metacognition and self-regulated learning—including planning, monitoring and evaluation—can support attainment.[^6]

The defensible product opportunity is a structured study companion. It should help a learner decide and practise, while keeping effort and judgment with the learner.

### Four-week fit

- **Week 1:** Turn goals, deadlines and available time into a realistic weekly study plan.
- **Week 2:** Answer questions from uploaded course material with clear citations.
- **Week 3:** Use check-ins or quiz results to propose plan changes and draft reminders.
- **Week 4:** Evaluate source-grounding, question quality, schedule feasibility and learner usefulness.

### Important constraint

The app may explain, quiz and guide. It should not impersonate the learner, submit assignments or produce work intended to evade academic-integrity rules.

## 4. Evidence Discovery & Research Synthesis

### Problem

Students and researchers face more papers than they can inspect closely. It is difficult to judge relevance, compare findings and preserve the link between a claim and its source. The product should assist triage and organisation while leaving inclusion decisions and interpretation with the researcher.

### Evidence

Research on scholarly information abundance reports rapid growth in accessible publications and describes the resulting information-overload challenge for researchers and evidence synthesis.[^7] An Agency for Healthcare Research and Quality assessment found that machine-learning tools can help prioritise records during systematic-review screening, but that automatically eliminating records carries less certain evidence and should be approached cautiously.[^8]

That distinction provides an excellent AI-engineering lesson: the product can rank, organise and explain, but high-recall decisions need transparent evidence and human control.

### Four-week fit

- **Week 1:** Summarise and categorise a small set of titles and abstracts.
- **Week 2:** Ask questions across selected papers and return claim-level citations.
- **Week 3:** Draft a workflow for import, deduplication, screening and evidence-table creation.
- **Week 4:** Evaluate citation correctness, unsupported claims and missed relevant papers.

### Important constraint

Do not market the app as an autonomous systematic reviewer. Citation links, uncertainty and reviewer confirmation are core product behaviour, not optional polish.

## 5. Personal Administration & Renewal Intelligence

### Problem and evidence

People manage bills, subscriptions, warranties, contracts and renewal dates across inboxes and documents. UK government research found that simplifying presentation and using explanatory summaries can improve consumer understanding of contractual terms.[^9] OECD research also describes fragmented entry points and difficult administrative processes as barriers to accessing support.[^10] The opportunity is a private document assistant that finds obligations and dates, not a system that makes legal or financial decisions.

### Four-week fit

- **Week 1:** Extract dates, costs and obligations from one document.
- **Week 2:** Answer cited questions across a private document collection.
- **Week 3:** Draft reminders and next steps for explicit approval.
- **Week 4:** Evaluate extraction accuracy, missed deadlines, privacy and unsafe advice.

## 6. Household Energy Intelligence & Optimisation

### Problem and evidence

Energy data is often retrospective and difficult for a household to translate into action. The IEA reports that simplification, framing and feedback mechanisms can support household energy decisions, and estimates that home energy reports can reduce electricity use by up to 2.2% and gas use by up to 1.6%.[^11] The product opportunity is to explain patterns and recommend small experiments while clearly labelling uncertainty—not to promise savings from incomplete data.

### Four-week fit

- **Week 1:** Explain a bill and flag meaningful changes.
- **Week 2:** Ground recommendations in trusted energy-efficiency guidance.
- **Week 3:** Create a monitored action plan with check-ins.
- **Week 4:** Evaluate calculations, recommendation support and usefulness.

## 7. Family Care Coordination & Continuity

### Problem and evidence

Family caregivers coordinate appointments, questions, documents and updates across several people. The CDC recommends care plans as a way to keep important information in one place, organise tasks and support continuity of care.[^12] The National Academies describes family caregiving as a major part of health and long-term care that can impose substantial practical burdens.[^13] This should remain a non-clinical coordination product: it must not diagnose, prescribe or change treatment.

### Four-week fit

- **Week 1:** Organise appointments, questions and family updates.
- **Week 2:** Retrieve cited information from approved care documents.
- **Week 3:** Draft checklists and permission-aware updates for approval.
- **Week 4:** Evaluate privacy, omissions, source-grounding and unsafe medical output.

## 8. Customer Signal & Product Intelligence

### Problem and evidence

Customer evidence arrives through calls, support tickets, surveys and reviews. Productboard's vendor-sponsored survey reported that many teams lacked a central, accessible repository for product insights; the numbers should be treated as directional rather than independent market measurement.[^14] Research prototypes also show that language models can support qualitative feedback analysis, while still requiring traceability and human interpretation.[^15] A strong product therefore links every generated theme back to the underlying feedback.

### Four-week fit

- **Week 1:** Cluster a small feedback set into inspectable themes.
- **Week 2:** Search feedback and cite supporting customer statements.
- **Week 3:** Draft an evidence-backed opportunity brief.
- **Week 4:** Evaluate theme stability, coverage, bias and hallucination.

## 9. Public Service & Benefits Navigation

### Problem and evidence

People may struggle to find the right service, understand official guidance and know what information an application requires. OECD research reports low confidence in accessing support and highlights fragmentation, complexity and administrative burden as barriers.[^10][^16] The product should cite current official pages, display freshness and prepare a checklist. It must never guarantee eligibility or submit an application without the user.

### Four-week fit

- **Week 1:** Turn a user situation into a clear service checklist.
- **Week 2:** Answer questions using current, cited official sources.
- **Week 3:** Draft an application-preparation workflow for approval.
- **Week 4:** Evaluate source freshness, citation accuracy and eligibility overclaims.

## 10. Inbox-to-Action Intelligence

### Problem and evidence

Messages combine decisions, requests, deadlines and noise. Microsoft's 2024 Work Trend Index reported that 68% of surveyed knowledge workers struggled with the pace and volume of work, while the typical person read roughly four emails for each one sent.[^17] Its 2023 research found that 64% struggled to find enough time and energy for their work and that communication occupied more time than creation in Microsoft 365 activity.[^18] The useful scope is a reviewable action queue—not autonomous replies.

### Four-week fit

- **Week 1:** Classify sample messages and extract actions and dates.
- **Week 2:** Use policies and project context to explain priority.
- **Week 3:** Draft replies, tasks and reminders for approval.
- **Week 4:** Evaluate missed urgency, false alarms, privacy and tone.

## Week 0 experience

Week 0 should contain no teaching videos and no build phase. The complete learner journey is:

1. Join the WhatsApp group.
2. Set up Python, Claude Code and GitHub.
3. Explore the ten researched problem directions.
4. Choose one, or bring a problem you understand first-hand.
5. Research the affected user, current alternatives and important gaps.
6. Submit a short understanding report.

The report can remain lightweight:

- Who experiences the problem?
- How do they solve it today?
- What is frustrating or unreliable about the current approach?
- What is the smallest useful Week 1 outcome?
- What will not be built?

Week 0 completion should not depend on having a polished solution. Its purpose is to replace a vague idea with a sufficiently clear problem and a working laptop.

[^1]: United Nations Environment Programme, “[Food Waste Index Report 2024](https://www.unep.org/resources/publication/food-waste-index-report-2024),” 27 March 2024.
[^2]: Nimeshika Aloysius et al., “[Why people are bad at leftover food management?](https://doi.org/10.1016/j.appet.2023.106577),” *Appetite*, 2023.
[^3]: Microsoft WorkLab, “[How AI Can Help Build More Intentional Meetings](https://www.microsoft.com/en-us/worklab/how-ai-can-help-build-more-intentional-meetings),” 16 April 2024.
[^4]: Ava Elizabeth Scott, Lev Tankelevitch, and Sean Rintel, “[Mental Models of Meeting Goals](https://www.microsoft.com/en-us/research/wp-content/uploads/2024/01/chi24-774-authorcameraready.pdf),” CHI 2024.
[^5]: OECD, “[Students’ readiness for self-directed learning](https://www.oecd.org/en/publications/pisa-2022-results-volume-v_c2e44201-en/full-report/component-17.html),” PISA 2022 Results, 2024.
[^6]: Daniel Muijs and Christian Bokhove, “[Metacognition and Self-regulation](https://educationendowmentfoundation.org.uk/education-evidence/evidence-reviews/metacognition-and-self-regulation),” Education Endowment Foundation, 2020.
[^7]: Michael Gusenbauer, “[The age of abundant scholarly information and its synthesis](https://pmc.ncbi.nlm.nih.gov/articles/PMC9291810/),” *Research Synthesis Methods*, 2021.
[^8]: Agency for Healthcare Research and Quality, “[Performance and Usability of Machine Learning for Screening in Systematic Reviews](https://www.ncbi.nlm.nih.gov/books/NBK550175/),” 2019.
[^9]: UK Department for Business, Energy & Industrial Strategy, “[Contractual terms and privacy policies: how to improve consumer understanding](https://www.gov.uk/government/publications/contractual-terms-and-privacy-policies-how-to-improve-consumer-understanding),” 2019.
[^10]: OECD, “[Building human-centred and proactive government services in the digital age](https://www.oecd.org/en/publications/2026/06/digital-government-outlook_4585678e/full-report/building-human-centred-and-proactive-government-services-in-the-digital-age_7cc9d8c5.html),” *Digital Government Outlook*, 2026.
[^11]: International Energy Agency, “[The potential of behavioural interventions for optimising energy use at home](https://www.iea.org/articles/the-potential-of-behavioural-interventions-for-optimising-energy-use-at-home),” 2021.
[^12]: US Centers for Disease Control and Prevention, “[Creating a Care Plan for Caregivers](https://www.cdc.gov/caregiving/guidelines/index.html),” 2024.
[^13]: National Academies of Sciences, Engineering, and Medicine, “[Families Caring for an Aging America](https://www.nationalacademies.org/publications/23606),” 2016.
[^14]: Productboard, “[The State of Product Excellence](https://info.productboard.com/rs/128-JHR-871/images/PE%20Survey%202021.pdf),” 2021. Vendor-sponsored survey.
[^15]: Alexander B. Holl, Kaustubh Kulkarni, and Bonnie Dorr, “[Extracting User Experience from Online Customer Reviews](https://arxiv.org/abs/2407.15519),” 2024.
[^16]: OECD, “[Keeping rules fit for purpose through evaluation and review](https://www.oecd.org/en/publications/better-regulation-practices-across-the-european-union-2025_6f007516-en/full-report/keeping-rules-fit-for-purpose-through-evaluation-and-review_b4cdc80b.html),” 2025.
[^17]: Microsoft WorkLab, “[AI at Work Is Here. Now Comes the Hard Part](https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part),” 2024.
[^18]: Microsoft WorkLab, “[Will AI Fix Work?](https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work),” 2023.

## Sources

1. United Nations Environment Programme. “[Food Waste Index Report 2024](https://www.unep.org/resources/publication/food-waste-index-report-2024).” 27 March 2024.
2. Aloysius, Nimeshika, Jayanath Ananda, Ann Mitsis, and David Pearson. “[Why people are bad at leftover food management? A systematic literature review and a framework to analyze household leftover food waste generation behavior](https://doi.org/10.1016/j.appet.2023.106577).” *Appetite*, Volume 186, 2023.
3. Microsoft WorkLab. “[How AI Can Help Build More Intentional Meetings](https://www.microsoft.com/en-us/worklab/how-ai-can-help-build-more-intentional-meetings).” 16 April 2024.
4. Scott, Ava Elizabeth, Lev Tankelevitch, and Sean Rintel. “[Mental Models of Meeting Goals: Supporting Intentionality in Meeting Technologies](https://www.microsoft.com/en-us/research/wp-content/uploads/2024/01/chi24-774-authorcameraready.pdf).” CHI 2024.
5. OECD. “[Students’ readiness for self-directed learning: PISA 2022 Results (Volume V)](https://www.oecd.org/en/publications/pisa-2022-results-volume-v_c2e44201-en/full-report/component-17.html).” 2024.
6. Muijs, Daniel, and Christian Bokhove. “[Metacognition and Self-regulation: Evidence Review](https://educationendowmentfoundation.org.uk/education-evidence/evidence-reviews/metacognition-and-self-regulation).” Education Endowment Foundation, May 2020.
7. Gusenbauer, Michael. “[The age of abundant scholarly information and its synthesis—A time when ‘just google it’ is no longer enough](https://pmc.ncbi.nlm.nih.gov/articles/PMC9291810/).” *Research Synthesis Methods*, 2021.
8. Agency for Healthcare Research and Quality. “[Performance and Usability of Machine Learning for Screening in Systematic Reviews](https://www.ncbi.nlm.nih.gov/books/NBK550175/).” Methods Research Report, 2019.
9. UK Department for Business, Energy & Industrial Strategy. “[Contractual terms and privacy policies: how to improve consumer understanding](https://www.gov.uk/government/publications/contractual-terms-and-privacy-policies-how-to-improve-consumer-understanding).” 2019.
10. OECD. “[Building human-centred and proactive government services in the digital age](https://www.oecd.org/en/publications/2026/06/digital-government-outlook_4585678e/full-report/building-human-centred-and-proactive-government-services-in-the-digital-age_7cc9d8c5.html).” 2026.
11. International Energy Agency. “[The potential of behavioural interventions for optimising energy use at home](https://www.iea.org/articles/the-potential-of-behavioural-interventions-for-optimising-energy-use-at-home).” 2021.
12. US Centers for Disease Control and Prevention. “[Creating a Care Plan for Caregivers](https://www.cdc.gov/caregiving/guidelines/index.html).” 2024.
13. National Academies of Sciences, Engineering, and Medicine. “[Families Caring for an Aging America](https://www.nationalacademies.org/publications/23606).” 2016.
14. Productboard. “[The State of Product Excellence](https://info.productboard.com/rs/128-JHR-871/images/PE%20Survey%202021.pdf).” 2021. Vendor-sponsored survey.
15. Holl, Alexander B., Kaustubh Kulkarni, and Bonnie Dorr. “[Extracting User Experience from Online Customer Reviews](https://arxiv.org/abs/2407.15519).” 2024.
16. OECD. “[Keeping rules fit for purpose through evaluation and review](https://www.oecd.org/en/publications/better-regulation-practices-across-the-european-union-2025_6f007516-en/full-report/keeping-rules-fit-for-purpose-through-evaluation-and-review_b4cdc80b.html).” 2025.
17. Microsoft WorkLab. “[AI at Work Is Here. Now Comes the Hard Part](https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part).” 2024.
18. Microsoft WorkLab. “[Will AI Fix Work?](https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work).” 2023.
