import type { LandingPageData } from '@/components/landing/LandingPageScaffold';

export const elderCare: LandingPageData = {
  slug: 'services/elder-care',
  pageTitle: 'Elder Care at Home in Trinidad & Tobago | Tavara Care',
  metaDescription:
    'In-home elder care across Trinidad and Tobago. Vetted caregivers, coordinated by Tavara — matching, scheduling, daily care logs, and family oversight.',
  h1: 'Elder care at home',
  kicker: 'Elder care · Trinidad & Tobago',
  intro:
    'When a parent or grandparent needs more support at home, Tavara matches your family with caregivers and coordinates the care around your loved one. You stay in charge of the decisions. We hold the moving parts.',
  sections: [
    {
      heading: 'What elder care at home looks like',
      body:
        'A caregiver visits on a schedule that fits your loved one — daytime hours, evenings, overnight, or live in. They support daily routines: getting up, bathing and dressing, meals, medication, mobility, companionship, and rest. Everything done during a shift is captured in a daily care log so the family is never left guessing.',
    },
    {
      heading: 'Who this is for',
      body:
        'Families whose parent is starting to need help with daily routines.\nElders recovering from a hospital stay who should not be alone.\nHouseholds where the primary family caregiver is burning out.\nFamilies with diaspora siblings who need a shared view of what is happening.\nElders who want to stay at home rather than move into a facility.',
    },
    {
      heading: 'How Tavara coordinates the care',
      body:
        'We build a small care team — a primary caregiver and a fill in for sick days. We match by proximity, skills, and personality fit, not just availability. The dashboard holds the schedule, the care plan, the daily logs, and caregiver payment coordination. If something needs to change, we re-match without you starting over.',
    },
  ],
  faqs: [
    {
      q: 'Is elder care the same as a nursing home?',
      a: 'No. Tavara coordinates in-home care so your loved one stays in their own home with familiar surroundings and family nearby.',
    },
    {
      q: 'What does elder care cost?',
      a: 'Care rates are $40 per hour Standard, $45 per hour Full Service, $50 plus per hour Premium. The hours depend on what your loved one needs. Subscription tier details are shared during onboarding.',
    },
    {
      q: 'Can we start with a few hours a day and expand later?',
      a: 'Yes. Many families start small to let everyone adjust, then add hours as trust builds.',
    },
    {
      q: 'What if the caregiver is sick?',
      a: 'Coverage is part of why families choose Tavara. We coordinate a fill in caregiver so the family does not have to scramble.',
    },
  ],
  schemaType: 'Service',
  serviceType: 'Elder care at home',
};

export const dementiaCare: LandingPageData = {
  slug: 'services/dementia-care',
  pageTitle: 'Dementia & Alzheimer\'s Care at Home | Tavara Care',
  metaDescription:
    'Dementia friendly in-home care across Trinidad and Tobago. Tavara matches families with caregivers experienced in Alzheimer\'s, sundowning, and memory loss.',
  h1: 'Dementia and Alzheimer\'s care at home',
  kicker: 'Dementia care · Trinidad & Tobago',
  intro:
    'Caring for a loved one with dementia is exhausting in ways that are hard to explain to anyone who has not done it. Tavara matches your family with caregivers who understand memory loss, sundowning, and the small routines that keep the day calm.',
  sections: [
    {
      heading: 'Dementia friendly support',
      body:
        'Caregivers trained in dementia care use predictable routines, gentle redirection, environmental cues, and patience. They watch for wandering, fall risk, agitation, and changes in eating or sleep. The goal is steady days and rest for the family.',
    },
    {
      heading: 'What we look for in dementia caregivers',
      body:
        'Experience with memory loss and confusion.\nCalm under behavioural changes including sundowning.\nUnderstanding of safety risks at home.\nAbility to keep daily routines without rushing.\nGood handover and daily log discipline so the family knows what happened.',
    },
    {
      heading: 'Coordination matters most in dementia care',
      body:
        'One missed shift can collapse the day for someone with dementia. Tavara holds the care team together so coverage is reliable. The daily log shows what worked and what did not, so each new shift starts informed rather than guessing.',
    },
  ],
  faqs: [
    {
      q: 'Can Tavara support live in dementia care?',
      a: 'Yes. Live in works well for moderate to advanced dementia. We rotate caregivers so one person is not on duty around the clock.',
    },
    {
      q: 'What if my loved one resists having a caregiver?',
      a: 'Resistance is normal. We start with shorter visits, the same caregiver each time, and let trust build before expanding hours.',
    },
    {
      q: 'What does dementia care cost?',
      a: 'Most dementia care falls into the Full Service ($45 per hour) or Premium ($50 plus per hour) tier depending on complexity. Subscription details are shared during onboarding.',
    },
    {
      q: 'Do caregivers communicate with the family\'s doctor?',
      a: 'The dashboard care log is designed to be shared with the family\'s medical team so visits and medication changes stay informed.',
    },
  ],
  schemaType: 'Service',
  serviceType: 'Dementia and Alzheimer\'s care at home',
};

export const postSurgeryCare: LandingPageData = {
  slug: 'services/post-surgery-care',
  pageTitle: 'Post-Surgery Care at Home | Tavara Care',
  metaDescription:
    'In-home recovery care after surgery across Trinidad and Tobago. Tavara coordinates caregivers for mobility, medication, and safe healing at home.',
  h1: 'Post surgery recovery at home',
  kicker: 'Post surgery care · Trinidad & Tobago',
  intro:
    'The first weeks after surgery are when families need the most help and have the least bandwidth. Tavara matches your family with caregivers who support recovery at home — mobility, medication, hygiene, meals, and watchful eyes — so healing is safe and the family is not stretched thin.',
  sections: [
    {
      heading: 'Recovery support that fits the discharge plan',
      body:
        'After hip surgery, knee replacement, abdominal surgery, cardiac procedures, or extended hospital stays, your loved one needs help moving safely, managing pain medication on time, and avoiding the falls and complications that send people back to hospital. Tavara caregivers work alongside your loved one through the recovery weeks.',
    },
    {
      heading: 'What caregivers support during recovery',
      body:
        'Safe transfers from bed, chair, and bathroom.\nMedication administration with timestamps.\nWound observation and reporting changes to the family.\nMeal preparation and hydration.\nLight personal care and hygiene.\nCompanionship during the long recovery days.\nDriving the family to follow up appointments where applicable.',
    },
    {
      heading: 'Short term coverage, structured handover',
      body:
        'Recovery care is usually time bounded — a few weeks to a few months. Tavara is built for that. We start coverage quickly, scale hours up or down as recovery progresses, and close cleanly when your loved one no longer needs the support.',
    },
  ],
  faqs: [
    {
      q: 'How quickly can post surgery care start?',
      a: 'Often within 24 to 48 hours if we know about the surgery in advance. Same day coverage is sometimes possible through the urgent queue.',
    },
    {
      q: 'Do you have caregivers with clinical experience?',
      a: 'Yes. Premium tier caregivers include those with nursing assistant and nursing backgrounds. We match clinical scope to the recovery plan.',
    },
    {
      q: 'What does recovery care cost?',
      a: 'Care rates are $40 per hour Standard, $45 per hour Full Service, $50 plus per hour Premium. Hours depend on the recovery plan.',
    },
    {
      q: 'Can we scale down the hours as my parent recovers?',
      a: 'Yes. Recovery care is built to taper. We adjust the schedule as your loved one regains independence.',
    },
  ],
  schemaType: 'Service',
  serviceType: 'Post surgery recovery care at home',
};

export const liveInCare: LandingPageData = {
  slug: 'services/live-in-care',
  pageTitle: 'Live-In Care at Home | Tavara Care',
  metaDescription:
    'Live-in caregivers across Trinidad and Tobago. Tavara coordinates rotation, daily care logs, and family oversight for round the clock support.',
  h1: 'Live in care at home',
  kicker: 'Live in care · Trinidad & Tobago',
  intro:
    'When your loved one needs continuous support at home, Tavara coordinates live in care with rotating caregivers so no single person is on shift around the clock. Your loved one stays in their own home. The family stays in the loop.',
  sections: [
    {
      heading: 'When live in care is the right fit',
      body:
        'Live in suits households where your loved one cannot be safely left alone overnight, where dementia or mobility risks make supervision continuous, or where the family caregiver has reached a point of complete exhaustion. It also fits households with no nearby family.',
    },
    {
      heading: 'How rotation actually works',
      body:
        'A primary live in caregiver covers the bulk of the week with structured rest hours each day. A second caregiver covers their off days so coverage is unbroken. Tavara holds the rotation calendar, handles the handover, and tracks the daily care log so the family always knows what is happening in the home.',
    },
    {
      heading: 'What live in care covers',
      body:
        'Continuous supervision and companion presence.\nAll personal care, hygiene, and mobility support.\nMedication administration with logs.\nMeals, hydration, and feeding.\nOvernight safety and toileting.\nHousehold routines around your loved one.\nReporting changes in condition to the family.',
    },
  ],
  faqs: [
    {
      q: 'Is live in care 24 hours of work for the caregiver?',
      a: 'No. Caregivers get protected rest hours each day. Continuous coverage is achieved through rotation, not by overworking one person.',
    },
    {
      q: 'What does live in care cost?',
      a: 'Live in is priced as a structured weekly arrangement based on rates and rotation, shared transparently during onboarding. Care rates remain $40 / $45 / $50 plus per hour depending on tier.',
    },
    {
      q: 'Can family come and go during live in care?',
      a: 'Yes. Family presence is welcome and often improves the arrangement. The caregiver is there to support, not to take over.',
    },
    {
      q: 'How do we know what is happening day to day?',
      a: 'The dashboard care log is updated each shift. Family members can view it from anywhere, including the diaspora.',
    },
  ],
  schemaType: 'Service',
  serviceType: 'Live in care at home',
};

export const services = [elderCare, dementiaCare, postSurgeryCare, liveInCare];
