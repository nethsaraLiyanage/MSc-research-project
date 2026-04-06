# Evaluation Plan - AITor Personalized Learning Framework

## 1. Research Focus and Hypotheses

This research evaluates whether AITor, a prototype platform combining engagement analysis, recommendation, and feedback, improves learning outcomes in online education compared with non-adaptive delivery.

The evaluation addresses these research questions:

- RQ1: Does personalized learning strategy assignment (video/text/audio) improve student engagement and productivity?
- RQ2: Can facial-behavior and interaction signals provide reliable real-time estimates of learner engagement?
- RQ3: Do students perform differently under different learning modalities?
- RQ4: Is the recommendation algorithm more effective than non-personalized assignment?
- RQ5: Does real-time adaptive feedback improve outcomes and motivation?

Testable hypotheses:

- H1: Adaptive AITor users will show significantly higher post-test gains than baseline users.
- H2: System-generated engagement scores will positively correlate with independent engagement measures (self-report and tutor observation).
- H3: Personalized modality assignment will outperform fixed one-modality learning.
- H4: Recommendation-driven assignment will outperform random or static assignment.
- H5: Real-time feedback will reduce disengagement and improve completion and retention.

## 2. Evaluation Approach

A mixed-method approach will be used:

- Quantitative (primary): experiment-based pilot using pre-test/post-test, logs, and performance measures.
- Qualitative (supporting): student/tutor surveys and short interviews to assess usability, trust, and perceived usefulness.

This approach is selected to evaluate both measurable learning impact and practical acceptability in realistic online learning conditions.

## 3. Data Sources and Credibility

Primary dataset (private, pilot-generated):

- Behavioral features from webcam-based engagement capture (attention-related cues),
- Interaction logs (time-on-task, response latency, completion patterns),
- Learning performance (pre-test/post-test scores),
- Survey/interview responses from students and tutors.

Credibility controls:

- Standardized pre/post assessments with controlled content and duration,
- Common learning tasks across conditions,
- Consent-based data collection with anonymized participant identifiers,
- Data quality checks for incomplete sessions, outliers, and missing values.

If a public dataset is used for model calibration, it will be justified by peer-reviewed origin, clear labeling procedures, and relevance to educational engagement detection.

## 4. Experiments per Research Question

Experiment E1 - Personalization impact:

- Objective: Test H1 and H5 (RQ1, RQ5).
- Design: Compare adaptive AITor mode against baseline non-adaptive mode.
- Metrics: Gain score (post - pre), completion rate, time-to-completion, disengagement events.
- Analysis: Paired/independent t-tests and ANCOVA where appropriate.

Experiment E2 - Engagement estimation validity:

- Objective: Test H2 (RQ2).
- Design: Compare system engagement score with self-report and tutor observation ratings.
- Metrics: Correlation and agreement trends across sessions.
- Analysis: Pearson/Spearman correlation and confidence intervals.

Experiment E3 - Learning modality effectiveness:

- Objective: Test H3 (RQ3).
- Design: Evaluate performance under video-, text-, and audio-based strategies.
- Metrics: Assessment score, retention, task efficiency.
- Analysis: ANOVA (or non-parametric equivalent) with post-hoc comparisons.

Experiment E4 - Recommendation algorithm comparison:

- Objective: Test H4 (RQ4).
- Design: Compare DWPA recommendations against random and static assignment baselines.
- Metrics: Mean score gain, engagement uplift, recommendation success rate.
- Analysis: ANOVA/equivalent tests and effect-size reporting.

## 5. Establishing Results and Acceptance Criteria

Baselines and ground truth:

- Baselines: fixed non-adaptive pathway, random strategy assignment, and simple rule-based assignment (if available).
- Ground truth proxies for engagement: self-report scale, tutor observation rubric, and behavior log consistency.

Decision criteria:

- Statistical significance threshold p < 0.05,
- Effect sizes (Cohen's d, eta-squared) for practical relevance,
- Educationally meaningful improvement targets (for example, >=10% gain in post-test or reduced disengagement frequency).

## 6. Tools and Techniques

- AITor prototype modules: engagement analysis, DWPA recommendation engine, feedback module.
- Data handling and analysis: Python (Pandas, SciPy, Statsmodels) and visualization (Matplotlib/Seaborn).
- Qualitative analysis: thematic coding of survey/interview responses.
- Traceability: log each recommendation event, selected modality, and subsequent learner outcome.

## 7. Procedure, Ethics, and Validity Controls

Procedure:

- Recruit pilot participants,
- Obtain informed consent,
- Run pre-test, intervention sessions, and post-test,
- Collect surveys/interviews after completion.

Ethics and privacy:

- Voluntary participation and right to withdraw,
- Explicit consent for webcam-based analysis,
- Anonymized storage and restricted access to data.

Threats to validity and mitigation:

- Small sample size: report confidence intervals and effect sizes, clearly state pilot limitations.
- Novelty effect: use multiple sessions instead of single exposure.
- Device/network variability: record context and control statistically if needed.
- Engagement subjectivity: triangulate with multiple indicators.

## 8. Expected Deliverables from Evaluation

- Experiment protocol and variable definitions,
- Anonymized evaluation dataset summary,
- Statistical result tables and plots,
- Qualitative findings with thematic summaries,
- Final hypothesis-status matrix (Supported / Partially Supported / Not Supported).

This evaluation plan provides a feasible, academically defensible path to validate whether AITor can improve engagement and learning outcomes through guided personalization in online education.
