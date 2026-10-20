# -*- coding: utf-8 -*-
"""English content for the NX Commerce Infrastructure pages.

A translation of data.py, not a rewrite: every figure, story beat and capability
matches the Arabic page it mirrors, so the two halves of the site say the same
thing. Apostrophes are typographic (’) throughout — the plain ASCII quote would
break the moment a value is interpolated into a script.
"""

CAPS = {
 'kyc': ('Merchant onboarding and verification (eKYC / KYB)', 'id',
   'Instead of sending each seller off to open an account with the payment gateway and '
   'come back, your platform runs the whole onboarding journey: document upload, '
   'verification status tracking, and approval rules you can customise.'),
 'sub': ('Sub-merchant accounts', 'card',
   'Every seller becomes an independent sub-account under your platform instead of '
   'pooling everyone into one account, with payment methods, fees and settlements '
   'managed per merchant.'),
 'split': ('Split payments', 'split',
   'A single transaction is divided automatically across several beneficiaries, each '
   'with a defined amount, without the platform first receiving the whole sum and then '
   'starting manual transfers.'),
 'comm': ('Platform commission', 'scale',
   'Your platform takes its commission out of the same transaction at the moment of '
   'payment. This is your commercial revenue, separate from payment processing fees.'),
 'ledger': ('Balances and settlements', 'chart',
   'A clear financial picture for every seller: sales, pending, fees, refunds, '
   'commission, net earnings and settlements, with downloadable reports.'),
 'payout': ('Payouts', 'bank',
   'Send earnings on demand or on a schedule to local bank accounts. Some transfers '
   'arrive instantly or near-instantly depending on the bank, the amount and the '
   'transfer channel.'),
 'refund': ('Full and partial refunds', 'refund',
   'Return the full amount, or only the part that relates to a cancelled portion of the '
   'service, while the remainder stays owed to the people entitled to it.'),
 'fees': ('Flexible fees and revenue sharing', 'star',
   'Different pricing plans by merchant, package or sector: basic, professional and '
   'enterprise at a negotiated rate.'),
 'auth': ('Authorization and capture', 'lock',
   'Hold the amount on the customer’s card without capturing it, then capture once the '
   'service is complete — or release the hold if the order is cancelled.'),
 'token': ('Recurring subscriptions (tokenization)', 'clock',
   'Store the payment method securely, then charge monthly or annually on its own '
   'without re-entering the card every time.'),
}

FINE = 'Payments are executed through a payment provider licensed by the Saudi Central Bank'
EYE = 'A real-world scenario'
MEYE = 'Money distribution'
CEYE = 'Capabilities'
CTITLE = 'The capabilities that power this solution'
ATITLE = 'Who is this for?'
SAR = 'SAR'


PLATFORM_EN = dict(
    eyebrow='Platform capabilities',
    title='What the marketplace can do',
    sub='What gets switched on depends on the agreed scope and the approved payment provider, and is confirmed before launch.',
    groups=[
        dict(name='Marketplace and catalogue', icon='shop', items=[
            ('Catalogue and categories',
             'The category tree and product attributes are built around what your marketplace '
             'actually sells — and what a seller may edit is set separately from what stays with you.'),
            ('Search and filtering',
             'Search inside the marketplace, filtered by category, price and seller. What surfaces '
             'and how results are ordered follows your priorities.'),
            ('A page per seller',
             'Each seller gets their own storefront inside your marketplace — products, ratings and '
             'policies — carrying your brand, not theirs.'),
            ('Multi-seller cart and order',
             'A customer buys from several sellers in one cart, and the order is divided between '
             'them at the moment of payment.'),
            ('Ratings and reviews',
             'Product or seller ratings once an order arrives, with publishing and reply rules set '
             'within scope.'),
            ('Shipping and delivery',
             'Shipping options and who carries the cost follow your model. Carrier integrations are '
             'assessed as part of the integration scope.'),
            ('Coupons and offers',
             'A discount across the marketplace, on one seller, or on one category — and who absorbs '
             'its cost is agreed before it goes live.'),
            ('Returns and exchanges',
             'The return window, who approves it and how it affects what is owed are all part of the '
             'workflow we build.'),
        ]),
        dict(name='Payments and settlement', icon='split', items=[
            ('Commission per seller or per category', 'Per-Merchant & Per-Category Commission',
             'A different rate for each seller, or for each product category, rather than one rate '
             'across the whole marketplace. The rules are set within scope and depend on the provider.'),
            ('Authorization and capture', 'Authorization & Capture',
             'The amount is held on the customer’s card without being charged, then captured after '
             'delivery or completion — or released before settlement. This is not an escrow account '
             'and creates no fiduciary holding.'),
            ('Splitting a payment', 'Split Payment',
             'One payment divided across several beneficiaries, with the shares summing to the '
             'transaction. Available for the models the provider has approved.'),
            ('Full and partial refunds', 'Full & Partial Refunds',
             'Return the whole amount or part of it. How quickly it lands differs between mada and '
             'the international card schemes.'),
            ('Payment methods',
             'mada, Visa, Mastercard, digital wallets and SADAD. Further methods are enabled per '
             'seller, subject to availability with the provider.'),
            ('Settlement',
             'Each seller settles to their own verified bank account, and the marketplace share '
             'settles separately. Schedule and minimums follow the approved provider.'),
            ('Recurring charges',
             'Store the payment method to collect a subscription or periodic fee without re-entering '
             'the card.'),
        ]),
        dict(name='Operations and control', icon='lock', items=[
            ('Seller onboarding and verification',
             'Sellers register inside your marketplace with their entity details and documents — and '
             'what is required differs by entity type: establishment, company, freelancer, non-profit.'),
            ('A clear status for every seller',
             'Under review, documents missing, partly active, active, on hold, rejected — shown to '
             'the seller with the reason and what will clear it.'),
            ('A test environment before go-live',
             'Every seller walks the order and payment journey in a sandbox before taking a real order.'),
            ('Seller dashboard',
             'Their orders, sales, balance, payouts and reports, in one place inside your marketplace.'),
            ('Balances and reporting',
             'Sales, pending, fees, refunds and net payable, with downloadable reports.'),
            ('Fraud protection',
             '3-D Secure, card tokenization and screening of suspicious transactions, as provided by '
             'the approved provider within the project scope.'),
        ]),
    ],
)


# ── the hero: one order, processed in front of you ────────────────────────
# The ring of eight labels it replaces was a map of the feature list — nothing
# in it moved through anything, so it argued that the product has parts rather
# than that it does work. This runs a single order end to end instead: the
# seller is checked, the amount is held, the commission is worked out, the
# money divides. Amounts live here; the percentages come from the money board
# further down the page, so the two can never drift apart.
HERO_EN = dict(
    live='Processing now',
    tag='live',
    stage='Order',
    orders=[('ORD-74518', 'Najd Industrial Parts', 1480.00),
            ('ORD-74519', 'Al-Fahd Tyres', 2470.00),
            ('ORD-74520', 'Gulf Spare Parts Workshop', 865.00)],
    steps=[('Seller checked', 'KYC · KYB', 'id', '0.3'),
           ('Amount held on the card', 'Authorization', 'lock', '0.6'),
           ('Commission worked out', 'Commission', 'scale', '0.1'),
           ('Split and paid out', 'Split & payout', 'split', '0.4')],
    unit='s',
    result='How the money divides',
    done='Settled',
    feed=[('New merchant', 'Al-Ward Perfumes — awaiting review', 'id'),
          ('Verification complete', 'KYC — owner identity matched', 'check'),
          ('Entity approved', 'KYB — commercial registration valid', 'lock'),
          ('Settlement', 'Paid out 12 sellers', 'bank')],
    a11y='Animated diagram: a single order moving through the platform — the seller is checked, the amount is held, the commission is worked out, then the money divides between the seller, the marketplace and the partner.',
)


VIDEO_EN = dict(
    eyebrow='Watch it work',
    title='See how the marketplace runs, in under ninety seconds',
    sub='From a seller signing up to the money dividing at checkout.',
    cta='Play the video',
    dur='1:28',
    a11y='Explainer video: an order moving through a multi-vendor marketplace, from seller onboarding to the payment being split.',
)


# ── the operations console: the screens, not a diagram of them ────────────
# Sample data, and the section says so on its face. The figures agree with each
# other on purpose — 148 orders x 1,233 is the SAR 182,450 printed beside them,
# and 7% of that is the 12,771 in the third tile, the same 7% the money board
# shows — because a mock whose own numbers disagree is the fastest way to look
# fake.
CONSOLE_EN = dict(
    eyebrow='Inside the console',
    title='The screen your team actually works in',
    sub='Four views from the operations console. The tabs work — open them.',
    note='Illustrative interface with sample data. The finished screens carry your brand, and what ships follows your project scope.',
    brand='Marketplace console',
    host='admin.example.sa',
    user='L. Alotaibi',
    role='Operations lead',
    nav=[('Overview', 'chart', ''), ('Orders', 'card', '24'), ('Sellers', 'users', '6'),
         ('Catalogue', 'shop', ''), ('Settlements', 'bank', ''), ('Commission rules', 'scale', ''),
         ('Reports', 'chart', '')],
    tabs=[
        dict(key='orders', label='Orders', term='Multi-vendor orders',
             kpis=[('Orders today', '148', '', '+12% vs yesterday', 'up'),
                   ('Sales today', '182,450', SAR, '+8% vs yesterday', 'up'),
                   ('Platform commission', '12,771', SAR, '7% of sales', ''),
                   ('Sellers with a sale', '63', '', 'of 118 sellers', '')],
             head=['Order', 'Seller', 'Status', 'Amount', 'Time'],
             rows=[('ORD-74512', 'Najd Industrial Parts', 'paid', 'Paid', '1,284.50', '09:41'),
                   ('ORD-74511', 'Al-Fahd Tyres', 'hold', 'Authorized', '2,470.00', '09:38'),
                   ('ORD-74509', 'Bawabat Equipment Co.', 'prep', 'Preparing', '319.00', '09:26'),
                   ('ORD-74506', 'Sadeem Fit-Out Supplies', 'ship', 'Shipped', '4,920.00', '09:04'),
                   ('ORD-74503', 'Al-Masar Lubricants', 'back', 'Partly refunded', '148.75', '08:52')],
             live=[('ORD-74513', 'Gulf Spare Parts Workshop', 'paid', 'Paid', '865.00', 'now'),
                   ('ORD-74514', 'Al-Masar Lubricants', 'hold', 'Authorized', '1,190.25', 'now'),
                   ('ORD-74515', 'Najd Industrial Parts', 'paid', 'Paid', '2,038.40', 'now')],
             strip=dict(title='Hold now, charge later', term='Authorization & Capture',
                        body='Order ORD-74511: the amount is held on the buyer’s card and has not been taken yet.',
                        steps=[('Authorized', '2,470.00 ' + SAR, 'done 09:38'),
                               ('Captured on dispatch', '2,470.00 ' + SAR, 'pending')])),
        dict(key='sellers', label='Sellers', term='KYC / KYB',
             kpis=[('Applications', '6', '', 'waiting on you', ''),
                   ('Fully verified', '112', '', 'of 118 sellers', 'up'),
                   ('Median time to approve', '1.4', 'days', 'last 30 days', ''),
                   ('Held for a document', '2', '', 'needs chasing', '')],
             steps=['Commercial registration', 'Owner ID', 'Bank account', 'Review'],
             head=['Business', 'Registration', 'Verification steps', 'Status'],
             rows=[('Sadeem Fit-Out Supplies', '1010 •• 4472', 4, 'ok', 'Approved'),
                   ('Al-Masar Lubricants', '1010 •• 8135', 3, 'wait', 'Awaiting bank confirmation'),
                   ('Bawabat Equipment Co.', '1010 •• 2049', 2, 'wait', 'KYB under review'),
                   ('Gulf Spare Parts Workshop', '1010 •• 6613', 1, 'stop', 'Held — registration expired')],
             advance=1, advanceTo=('ok', 'Approved'),
             toast=('Seller approved', 'Al-Masar Lubricants — verification complete')),
        dict(key='payouts', label='Settlements', term='Split & payouts',
             kpis=[('Batch total', '486,300', SAR, 'this week’s cycle', ''),
                   ('Sellers in the batch', '47', '', 'of 63 who sold', ''),
                   ('Paid out', '19', '', 'rest scheduled', 'up'),
                   ('Next run', 'in 2 days', '', 'Sunday 10:00', '')],
             splitLabel='How the batch divides',
             split=[('Seller earnings', 90, '437,670', 'seller'),
                    ('Platform commission', 7, '34,041', 'platform'),
                    ('Shipping partner', 3, '14,589', 'third')],
             head=['Seller', 'Orders', 'Owed', 'Account', 'Status'],
             rows=[('Najd Industrial Parts', '84', '71,240.00', 'SA•• 4417', 'ok', 'Paid out'),
                   ('Al-Fahd Tyres', '61', '52,815.50', 'SA•• 9028', 'ok', 'Paid out'),
                   ('Bawabat Equipment Co.', '38', '33,190.00', 'SA•• 1164', 'wait', 'Scheduled'),
                   ('Sadeem Fit-Out Supplies', '29', '24,605.75', 'SA•• 7302', 'wait', 'Scheduled')],
             foot='Amounts are net of commission and refunds. The payout schedule and channel follow the approved provider.'),
        dict(key='rules', label='Commission rules', term='Per-merchant & per-category',
             hint='The narrower rule wins: a seller rule beats a category rule, and a category rule beats the default.',
             head=['Applies to', 'Type', 'Value', 'Priority'],
             rules=[dict(scope='Whole marketplace', badge='Default', kind='Percentage', val='7%', pri='4', pct=7.0, fee=0),
                    dict(scope='Category: Electronics', badge='Category', kind='Percentage', val='5.5%', pri='3', pct=5.5, fee=0),
                    dict(scope='Category: Spare parts', badge='Category', kind='Percentage + fee', val='8% + ' + SAR + ' 12', pri='2', pct=8.0, fee=12),
                    dict(scope='Seller: Najd Industrial Parts', badge='Seller', kind='Percentage', val='6%', pri='1', pct=6.0, fee=0)],
             calc=dict(label='Sample order', amount='1,480.00', cur=SAR,
                       lines=['Order value', 'Platform commission', 'Seller receives'],
                       pick='Pick a rule to apply it to the order',
                       note='The arithmetic here is illustrative. Your actual rules and where they apply are agreed within the project.')),
    ],
    a11y='Illustrative operations console: orders, sellers, settlements and commission rules.',
)


MARKETPLACE = {'slug': 'marketplace',
 'video': VIDEO_EN,
 'console': CONSOLE_EN,
 'hero': HERO_EN,
 'crumb': 'Custom branded marketplace',
 'title': 'Custom Marketplace Workflows and Integrations | NX Marketplace Engine',
 'desc': 'A multi-vendor marketplace solution for specific business requirements. NX tailors interfaces, '
         'workflows and permissions, with integrations assessed within your project scope.',
 'badge': 'A solution tailored to your operations',
 'kicker': 'NX Marketplace Engine',
 'h1': ['A multi-vendor marketplace,', 'tailored to how you operate.'],
 'lede': 'Some marketplaces do not fit a template. A seller who clears two reviews before going live, '
         'a team where every role sees something different, or stock software nobody intends to replace. '
         'That is where we start: we map the journey with you, build the interfaces under your brand, '
         'and test whatever we agreed to connect before the first seller arrives.',
 'cta1': 'Discuss your project',
 'cta2': 'How we work through your requirements',
 'fineprint': 'What gets customised, what gets connected, and when it launches — all settled once we have reviewed your requirements.',
 'phone': {'title': 'Illustrative project scope',
           'toast': 'Your requirements',
           'amount': 'Your marketplace',
           'cur': '',
           'amountLabel': 'Tailored solution',
           'rows': [('Interfaces', 'Your brand'),
                    ('Workflows', 'Your operations'),
                    ('Permissions', 'By role'),
                    ('Integrations', 'Agreed scope')],
           'btn': 'Your project scope'},
 'story': {'eyebrow': 'Project journey',
           'title': 'From the first meeting to the first order',
           'sub': 'An illustrative example: a car-parts company selling to workshops and to the public, '
                  'each with its own pricing and permissions, running stock software it has no plans to '
                  'replace. That is where defining the scope begins.',
           'stops': [{'when': 'Discovery',
                      'icon': 'users',
                      'tag': 'Understand the business',
                      'big': 'Clear objectives',
                      'cap': 'Who sells, who buys, and how the money reaches them. We leave with a clear picture, not a wish list.'},
                     {'when': 'Scope',
                      'icon': 'link',
                      'tag': 'Requirements and integrations',
                      'big': 'An agreed scope',
                      'cap': 'We agree what will be built and what will not. Any link to your systems or '
                              'to a payment provider is checked before we promise it.'},
                     {'when': 'Configuration',
                      'icon': 'shop',
                      'tag': 'Tailor the experience',
                      'big': 'Under your brand',
                      'cap': 'The buyer’s side, the seller’s side, and your team’s dashboard — in your '
                              'identity, not a template with your logo dropped on it.'},
                     {'when': 'Testing',
                      'icon': 'check',
                      'tag': 'Review the sales journey',
                      'big': 'Before launch',
                      'cap': 'We walk the whole journey with your team: a seller signs up, an order is paid, an amount is refunded. Then we fix what breaks.'},
                     {'when': 'Launch',
                      'icon': 'bolt',
                      'tag': 'Begin operating',
                      'big': 'Your marketplace',
                      'cap': 'The first seller comes in, and the marketplace starts running.'}]},
 'money': {'eyebrow': 'Commission rule example',
           'title': 'Who gets what, and when',
           'sub': 'An arithmetic illustration, not service pricing or payment processing fees. Commission '
                  'and settlement rules are agreed in scope; execution depends on the provider and available '
                  'integration.',
           'totalLabel': 'Marketplace order',
           'total': 1000,
           'cur': 'SAR',
           'shares': [{'who': 'seller', 'label': 'Seller', 'value': 900, 'pct': 90, 'cur': 'SAR'},
                      {'who': 'platform',
                       'label': 'Platform commission',
                       'value': 70,
                       'pct': 7,
                       'cur': 'SAR'},
                      {'who': 'third', 'label': 'Partner', 'value': 30, 'pct': 3, 'cur': 'SAR'}]},
 'platform': PLATFORM_EN,
 'caps': {'eyebrow': 'What we define with you',
          'title': 'What we settle with you before anything is built',
          'items': [('Requirements discovery',
                     'users',
                     'Who are your buyers? Who sells to them? What has to work on day one? We '
                     'answer those before fixing any scope.'),
                    ('Branded interfaces',
                     'shop',
                     'The marketplace looks and reads like yours — not a stock template wearing your logo.'),
                    ('Business workflows',
                     'bolt',
                     'Who reviews what, when, and what happens when something is rejected. We map '
                     'it with you, step by step.'),
                    ('Roles and permissions',
                     'lock',
                     'Every role has its edge: who adds a seller, who approves a product, who sees the financials.'),
                    ('Seller management',
                     'id',
                     'The sign-up form, the documents required, the approval rule — built around your business, not a generic flow.'),
                    ('Commission rules',
                     'scale',
                     'One rate across the marketplace? Or a rate per seller, or per category? Settled before we build.'),
                    ('Project integrations',
                     'link',
                     'Assess connections to your systems and service providers. Each integration depends on '
                     'availability and confirmed requirements.'),
                    ('Testing and launch',
                     'check',
                     'Nothing launches until the agreed journeys and integrations have been through a review you are part of.')]},
 'audience': {'title': 'When is Marketplace Engine the right fit?',
              'chips': ['Requirements beyond ready settings',
                        'Business-specific selling journeys',
                        'Distinct operating roles',
                        'Systems that need integration']},
 'earn': {'title': 'How does this differ from Market Builder?',
          'items': ['Starts with your business requirements',
                    'Tailors interfaces, workflows and permissions',
                    'Scopes and tests the agreed integrations'],
          'note': 'NX delivers both routes. <strong>Marketplace Engine</strong> suits specific requirements. '
                  'If the ready platform and templates meet your needs, explore <a '
                  'href="/en/solutions/commerce/market-builder/"><strong>Market Builder</strong></a> for '
                  'configuration within its available capabilities.'},
 'close': {'h2': 'Let’s work out what your marketplace needs',
           'p': 'Tell us about the idea and the systems you already run. You leave the meeting with a written scope and a proposal to match.',
           'cta': 'Discuss your project'}}


PAY_SAAS = dict(
    slug='pay-for-saas',
    crumb='Payments inside your product',
    title='Embedded Payments for SaaS Products | NX Solutions',
    desc='Turn every customer in your software into a sub-merchant and take your share of each transaction automatically — no payment infrastructure to build.',
    badge='Embedded Payments for Saudi SaaS',
    kicker='NX Pay for SaaS',
    h1=['Add payments inside your product,', 'and earn from every transaction'],
    lede='If you build software for salons, clinics or restaurants, your customers take payments '
         'every day. With NX Pay each of them becomes a sub-merchant, transactions happen inside '
         'your system, and your share is taken automatically — without building payment '
         'infrastructure from scratch.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Salon system', toast='New salon is now a sub-merchant',
        amountRaw=3240, cur=SAR, amountLabel='Payments today',
        rows=[('Paid bookings', '14'), ('Platform share', '565 SAR'),
              ('This month’s subscription', 'Paid'), ('Next settlement', 'Tomorrow')],
        btn='View settlements',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: a software company serving hundreds of salons',
        sub='A Saudi company owns a booking system for salons and wants clients to pay inside the '
            'system instead of paying cash or through external links.',
        stops=[
            dict(when='Week 1', icon='link', tag='NX Pay switched on', big='Inside the system',
                 cap='The company adds NX Pay to its system without building payment infrastructure.'),
            dict(when='Week 2', icon='id', tag='A salon joins', big='KYB',
                 cap='Al-Ward Salon submits its details and documents from inside the system itself.'),
            dict(when='Appointment day', icon='card', tag='Client pays', big='250 SAR',
                 cap='A client books an appointment and pays straight from the booking page.'),
            dict(when='At payment', icon='split', tag='Automatic split', big='237.5 / 12.5',
                 cap='The amount goes to the salon, and the company takes its 5% automatically.'),
            dict(when='Every month', icon='clock', tag='Recurring subscription', big='99 SAR',
                 cap='The salon’s subscription renews automatically from the stored card.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='And your system gradually turns from a piece of software into a platform powered by payments.',
        totalLabel='Salon booking', total=250, cur=SAR,
        shares=[dict(who='seller', label='The salon', value=237.5, pct=95, cur=SAR),
                dict(who='platform', label='Software company’s share', value=12.5, pct=5, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['sub', 'kyc', 'split', 'comm', 'token', 'fees', 'ledger', 'payout']),

    audience=dict(title=ATITLE,
                  chips=['Salon booking systems', 'Clinic systems', 'Restaurant POS',
                         'Gym and club management', 'Property management', 'Education platforms']),

    earn=dict(title='How your company earns',
              items=['A share of every payment your customers’ customers make',
                     'Subscriptions collected automatically',
                     'Fee tiers by customer size']),

    close=dict(h2='Turn your system into a payments platform',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


SERVICES = dict(
    slug='services',
    crumb='Service marketplace',
    title='Service Marketplace, Paid After Completion | NX Solutions',
    desc='Launch a home or field service marketplace: hold the amount on the customer’s card at request, and capture it only once the job is confirmed complete.',
    badge='Service Marketplace Engine',
    kicker='NX Services',
    h1=['A service marketplace customers trust,', 'where money is captured after the job is done'],
    lede='Plumbing, electrical, cleaning, air conditioning, mobile car servicing. The amount is '
         'held on the customer’s card when they request the job, and is only captured once they '
         'confirm the work is complete. A far better experience than paying up front and then '
         'chasing a refund.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Plumber request', toast='Captured after confirmation',
        amountRaw=200, cur=SAR, amountLabel='Amount held',
        rows=[('Technician', 'On the way'), ('Expected arrival', '25 minutes'),
              ('Payment status', 'Held, not captured'), ('Cancellation', 'Free before arrival')],
        btn='Confirm job complete',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: Abu Fahd and the kitchen leak',
        sub='Nine in the evening, and water is leaking under the kitchen sink. Abu Fahd opens the '
            'app and requests a plumber.',
        stops=[
            dict(when='9:00 pm', icon='card', tag='Amount held', big='200 SAR',
                 cap='The amount is held on the card without being captured.'),
            dict(when='9:30 pm', icon='bolt', tag='Technician arrives', big='In progress',
                 cap='The plumber arrives and starts work.'),
            dict(when='10:15 pm', icon='check', tag='Abu Fahd confirms', big='Job complete',
                 cap='The customer confirms the job is finished from the app.'),
            dict(when='10:16 pm', icon='split', tag='Capture and split', big='180 / 20',
                 cap='The amount is captured: 180 to the technician and 20 platform commission.'),
            dict(when='Thursday', icon='bank', tag='Payout', big='To the bank account',
                 cap='The technician withdraws the week’s earnings to their account.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='And if the request is cancelled before the technician arrives, the hold on the card is released and nothing is captured.',
        totalLabel='Plumbing job', total=200, cur=SAR,
        shares=[dict(who='seller', label='Service provider', value=180, pct=90, cur=SAR),
                dict(who='platform', label='Platform commission', value=20, pct=10, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['auth', 'refund', 'split', 'comm', 'kyc', 'sub', 'payout', 'ledger']),

    audience=dict(title=ATITLE,
                  chips=['Plumbing and electrical', 'Cleaning', 'Air-conditioning servicing',
                         'Mobile car servicing', 'Photography', 'Freelance and consulting']),

    earn=dict(title='How your platform earns',
              items=['Commission on every completed job', 'Premium subscriptions for providers',
                     'Urgent or out-of-hours request fees']),

    close=dict(h2='Launch your service marketplace with trust from the first job',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


BOOKING = dict(
    slug='booking',
    crumb='Booking infrastructure',
    title='Booking Platform with Automated Cancellation | NX Solutions',
    desc='Booking infrastructure for chalets, clinics, pitches and car rental: hold at booking, capture under your policy, refund partially on cancellation.',
    badge='Booking Infrastructure',
    kicker='NX Booking',
    h1=['Booking infrastructure, with cancellation', 'policies that apply themselves'],
    lede='For chalets, clinics, pitches, salons, car rental and tourism experiences. The amount is '
         'held at the time of booking, captured according to your policy, and partially refunded on '
         'cancellation — with platform commission and the provider’s share distributed automatically.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Chalet booking', toast='Partial refund of 500 SAR',
        amountRaw=2000, cur=SAR, amountLabel='Booking value',
        rows=[('Duration', 'Three nights'), ('Payment status', 'Held'),
              ('Free cancellation', 'Up to 72 hours before'), ('Provider', 'Al-Nakheel Chalet')],
        btn='Confirm booking',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: a family books a chalet for the weekend',
        sub='The Al-Otaibi family books a chalet for three nights at 2,000 riyals through a booking platform.',
        stops=[
            dict(when='Monday', icon='card', tag='Amount held', big='2,000 SAR',
                 cap='The amount is held and the booking shows as confirmed for the family.'),
            dict(when='Monday', icon='clock', tag='Cancellation window', big='72 hours',
                 cap='The free cancellation window closes with no change to the booking.'),
            dict(when='Thursday', icon='check', tag='Arrival day', big='Captured',
                 cap='The amount is captured according to the policy at the booking date.'),
            dict(when='Friday', icon='refund', tag='Shortened stay', big='500 SAR refunded',
                 cap='The family leaves a night early, so part of the amount is refunded.'),
            dict(when='Settlement', icon='split', tag='Remainder distributed', big='1,350 / 150',
                 cap='Platform commission is 10%, and the rest goes to the chalet owner.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='A hold on a card is only valid for a limited period, so the policy is tuned to the gap between booking and appointment.',
        totalLabel='Amount after refund', total=1500, cur=SAR,
        shares=[dict(who='seller', label='Chalet owner', value=1350, pct=90, cur=SAR),
                dict(who='platform', label='Platform commission', value=150, pct=10, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['auth', 'refund', 'token', 'split', 'comm', 'sub', 'payout', 'fees']),

    audience=dict(title=ATITLE,
                  chips=['Chalets and rest houses', 'Clinics', 'Sports pitches', 'Salons',
                         'Car rental', 'Tourism experiences and coaches']),

    earn=dict(title='How your platform earns',
              items=['Commission on every booking', 'Subscriptions for providers',
                     'Cancellation fees under your policy']),

    close=dict(h2='Your bookings deserve payment infrastructure that understands your policies',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


PAYOUTS = dict(
    slug='payouts',
    crumb='Driver and gig payouts',
    title='Driver & Gig Worker Payout Platform | NX Solutions',
    desc='Every driver sees their earnings in real time and withdraws to their bank account at the tap of a button — instead of spreadsheets and manual transfers.',
    badge='Gig & Driver Payout Platform',
    kicker='NX Payouts',
    h1=['Driver earnings in their accounts,', 'at the tap of a button'],
    lede='For delivery companies, fleets, operations firms and the gig workforce. Every driver sees '
         'their earnings in real time and withdraws whenever they choose, and the infrastructure '
         'handles the transfer to their bank account — instead of spreadsheets and manual payments.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Today’s earnings', toast='Instant or near-instant transfer',
        amountRaw=387, cur=SAR, amountLabel='Available balance',
        rows=[('Orders today', '18'), ('Hours worked', '9 hours'),
              ('Peak bonus', '45 SAR'), ('Last withdrawal', 'Sunday')],
        btn='Withdraw now',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: a day in Majed’s work',
        sub='Majed is a delivery driver working with a company that uses NX Payouts. His day is over '
            'and he needs his earnings tonight.',
        stops=[
            dict(when='8:00 am', icon='truck', tag='Start of day', big='0 SAR',
                 cap='Majed starts his first round.'),
            dict(when='2:00 pm', icon='chart', tag='Real-time earnings', big='190 SAR',
                 cap='He watches his balance rise with every completed order.'),
            dict(when='10:00 pm', icon='check', tag='End of day', big='18 orders',
                 cap='The orders are done and the balance reaches 387 SAR.'),
            dict(when='10:05 pm', icon='bank', tag='Withdraw now', big='387 SAR',
                 cap='Majed requests the transfer of his balance to his bank account.'),
            dict(when='After the request', icon='bolt', tag='The transfer', big='Bank dependent',
                 cap='Within the same bank it can be instant; between banks it is near-instant up to 20,000 SAR via Sarie.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='An illustrative example. Transfer speed depends on the bank, the amount and the transfer channel.',
        totalLabel='Delivery fee on one order', total=30, cur=SAR,
        shares=[dict(who='seller', label='Driver', value=20, pct=67, cur=SAR),
                dict(who='platform', label='Delivery company', value=10, pct=33, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['payout', 'ledger', 'sub', 'kyc', 'split', 'fees']),

    audience=dict(title=ATITLE,
                  chips=['Delivery companies', 'Fleets', 'Driver networks', 'Gig workforce',
                         'Operations companies', 'Transport services']),

    earn=dict(title='The value to your company',
              items=['Optional fee on instant withdrawal', 'Higher driver loyalty',
                     'Precise reporting per driver and per city']),

    close=dict(h2='Make paying your drivers a competitive advantage',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


AFFILIATE = dict(
    slug='affiliate',
    crumb='Affiliate commerce',
    title='Affiliate Commerce Platform, Paid at Checkout | NX Solutions',
    desc='Affiliate infrastructure for Saudi commerce: tracking links, source attribution on every sale, and money split between store, affiliate and platform.',
    badge='Saudi Affiliate Commerce Infrastructure',
    kicker='NX Affiliate',
    h1=['Store, affiliate and platform — every', 'party gets their share the moment a sale happens'],
    lede='Affiliate commerce infrastructure for the Saudi market: stores list their products, '
         'affiliates promote through their own links, the system attributes the source of every '
         'transaction, and at payment the money is split automatically. No spreadsheets at the end '
         'of the month.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Affiliate dashboard', toast='100 SAR commission received',
        amountRaw=4200, cur=SAR, amountLabel='Commission this month',
        rows=[('Link clicks', '3,180'), ('Sales', '42'),
              ('Last commission', '100 SAR'), ('Link status', 'Active')],
        btn='Share the link',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: Noura and a thousand-riyal smartwatch',
        sub='Noura is a tech content creator. She joins an affiliate platform and promotes a '
            'smartwatch from an electronics store.',
        stops=[
            dict(when='Monday', icon='id', tag='Noura joins', big='KYC',
                 cap='Noura registers and verifies her identity to become an approved beneficiary.'),
            dict(when='Tuesday', icon='link', tag='Personal link', big='Source tracking',
                 cap='She gets a tracking link and shares it in her content.'),
            dict(when='Wednesday', icon='card', tag='A purchase', big='1,000 SAR',
                 cap='One of her followers buys the watch through her link.'),
            dict(when='At payment', icon='split', tag='Three-way split', big='850 / 100 / 50',
                 cap='850 to the store, 100 to Noura, 50 to the platform.'),
            dict(when='End of week', icon='bank', tag='Withdraw commission', big='To the bank account',
                 cap='Noura withdraws her commission without waiting for month end.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='The percentages are illustrative, and each store sets the commission on its own products.',
        totalLabel='Sale through an affiliate', total=1000, cur=SAR,
        shares=[dict(who='seller', label='The store', value=850, pct=85, cur=SAR),
                dict(who='third', label='The affiliate', value=100, pct=10, cur=SAR),
                dict(who='platform', label='The platform', value=50, pct=5, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['split', 'comm', 'kyc', 'sub', 'ledger', 'payout', 'refund', 'fees']),

    audience=dict(title=ATITLE,
                  chips=['Electronics stores', 'Cosmetics', 'Fashion', 'Digital products',
                         'Training courses', 'Travel and tourism']),

    earn=dict(title='How your platform earns',
              items=['Commission on every affiliate sale', 'Subscriptions for participating stores',
                     'Premium plans for affiliates']),

    close=dict(h2='Build an affiliate network that runs itself',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


FRANCHISE = dict(
    slug='franchise',
    crumb='Franchise payments',
    title='Franchise Payment & Royalty System | NX Solutions',
    desc='Every branch is its own sub-account, with royalty and marketing-fund contributions taken from each invoice at payment — and one view for head office.',
    badge='Franchise Payment OS',
    kicker='NX Franchise',
    h1=['All your branches under one payment', 'umbrella, with royalties arriving automatically'],
    lede='For franchised brands and multi-brand groups. Every branch is an independent sub-account, '
         'and the royalty and the marketing-fund contribution are taken from every invoice at the '
         'moment of payment, with a single consolidated view for head office.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Head office dashboard', toast='5% royalty taken',
        amountRaw=184500, cur=SAR, amountLabel='Royalties this month',
        rows=[('Active branches', '100'), ('Top performer', 'Riyadh branch'),
              ('Marketing fund', '73,800 SAR'), ('Outstanding claims', 'None')],
        btn='Branch report',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: a local café that became 100 branches',
        sub='A Saudi café brand expanded through franchising, and used to collect royalties from its '
            'branches by hand every month.',
        stops=[
            dict(when='Before', icon='clock', tag='Manual collection', big='Monthly statements',
                 cap='Chasing, delays and numbers that did not match the branches’.'),
            dict(when='Go-live', icon='id', tag='Every branch a sub-account', big='100 branches',
                 cap='Riyadh, Jeddah, Dammam and the rest, all under one umbrella.'),
            dict(when='An invoice', icon='card', tag='A customer pays', big='100 SAR',
                 cap='Coffee and dessert at the Jeddah branch.'),
            dict(when='At payment', icon='split', tag='Automatic deduction', big='93 / 5 / 2',
                 cap='93 to the branch, 5 royalty to the brand, 2 to the marketing fund.'),
            dict(when='Month end', icon='star', tag='One report', big='All branches',
                 cap='Head office sees sales and royalties for every branch in one place.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='Royalty and marketing-fund percentages are configured to your franchise agreements.',
        totalLabel='Invoice at a branch', total=100, cur=SAR,
        shares=[dict(who='seller', label='Franchisee', value=93, pct=93, cur=SAR),
                dict(who='platform', label='Brand royalty', value=5, pct=5, cur=SAR),
                dict(who='third', label='Marketing fund', value=2, pct=2, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['sub', 'split', 'comm', 'fees', 'ledger', 'payout', 'token', 'kyc']),

    audience=dict(title=ATITLE,
                  chips=['Cafés', 'Quick-service restaurants', 'Training centres', 'Salons',
                         'Car washes', 'Multi-branch clinics']),

    earn=dict(title='The value to your brand',
              items=['Royalty collected in real time, with no chasing',
                     'A marketing fund that finances itself',
                     'Monthly franchise fees on recurring billing']),

    close=dict(h2='Unify your branch payments today',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


LOGISTICS = dict(
    slug='logistics-pay',
    crumb='Logistics payments',
    title='Multi-Party Logistics Payment System | NX Solutions',
    desc='Embed payments in transport management: hold the shipment value at booking, capture on proof of delivery, and split it across carrier, driver and partner.',
    badge='Multi-party Logistics Payments',
    kicker='NX Logistics Pay',
    h1=['Shipment value distributed across every', 'party, the moment delivery is proven'],
    lede='Payments embedded inside the transport management system: carrier verification, holding '
         'the shipment value at the time of request, capturing it after proof of delivery, then '
         'splitting it across carrier, driver, partner and platform and paying each of them out. '
         'A far stronger product than a conventional TMS.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Riyadh to Jeddah shipment', toast='Proof of delivery captured',
        amountRaw=1000, cur=SAR, amountLabel='Shipment value',
        rows=[('Status', 'In transit'), ('Carrier', 'Verified'),
              ('Payment', 'Held'), ('Proof of delivery', 'Awaiting signature')],
        btn='Track shipment',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: a shipment from Riyadh to Jeddah',
        sub='A factory in Riyadh requests transport of a shipment to its customer in Jeddah through '
            'a logistics platform.',
        stops=[
            dict(when='Before the order', icon='id', tag='Verified carrier', big='KYB',
                 cap='Carrier and driver are registered and verified in advance.'),
            dict(when='Saturday 9 am', icon='card', tag='Shipment value held', big='1,000 SAR',
                 cap='The amount is held on the factory’s card when the order is confirmed.'),
            dict(when='Sunday 2 pm', icon='truck', tag='Delivery', big='Proof of delivery',
                 cap='The recipient in Jeddah signs and proof of delivery is uploaded.'),
            dict(when='After delivery', icon='split', tag='Capture and split', big='Four parties',
                 cap='650 to the carrier, 200 to the driver, 100 to the partner, 50 to the platform.'),
            dict(when='Sunday', icon='bank', tag='Payouts', big='To each party',
                 cap='Each party withdraws what they are owed to their bank account.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='The percentages are illustrative, and the split is configured to your operating model.',
        totalLabel='Shipment', total=1000, cur=SAR,
        shares=[dict(who='seller', label='Carrier', value=650, pct=65, cur=SAR),
                dict(who='third', label='Driver', value=200, pct=20, cur=SAR),
                dict(who='fourth', label='Partner', value=100, pct=10, cur=SAR),
                dict(who='platform', label='Platform', value=50, pct=5, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['kyc', 'sub', 'auth', 'split', 'comm', 'payout', 'ledger', 'refund']),

    audience=dict(title=ATITLE,
                  chips=['Road freight companies', 'Freight brokers', 'Digital freight platforms',
                         'Private fleets', 'Intercity transport', 'Warehouses']),

    earn=dict(title='How your platform earns',
              items=['Commission on every shipment', 'Subscriptions for carriers and fleets',
                     'Fees for add-on services and express freight']),

    close=dict(h2='Turn your transport system into a complete payments platform',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


EXPERTS = dict(
    slug='experts',
    crumb='Expert marketplace',
    title='Expert & Creator Session Booking Platform | NX Solutions',
    desc='Launch a marketplace for consultants, coaches and creators: sell sessions, take a commission, give each expert a clear balance, and pay them out.',
    badge='Creator & Expert Marketplace',
    kicker='NX Experts',
    h1=['A marketplace for experts and creators,', 'earning from subscriptions and transactions'],
    lede='For consultants, coaches, designers and content creators. Onboarding and verification, '
         'selling sessions and services, platform commission, a clear balance for every expert and '
         'payouts to their account. And with a monthly subscription per expert, the platform earns '
         'from two sources at once.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Coach Reem’s profile', toast='New 5-star review',
        amountRaw=6840, cur=SAR, amountLabel='Earnings this month',
        rows=[('Completed sessions', '24'), ('Rating', '4.9 out of 5'),
              ('Plan', 'Professional'), ('Next session', 'Today 7 pm')],
        btn='Book a session',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: Reem the fitness coach',
        sub='Reem is a certified fitness coach who wants to sell her sessions online without getting '
            'caught up in collecting payments and making transfers.',
        stops=[
            dict(when='Day 1', icon='id', tag='Onboarding and verification', big='KYC',
                 cap='Reem registers and verifies her identity.'),
            dict(when='Day 1', icon='clock', tag='Professional plan', big='99 SAR / month',
                 cap='She picks a plan that renews automatically from her stored card.'),
            dict(when='Day 3', icon='cal', tag='First booking', big='300 SAR',
                 cap='A client books a session and pays directly.'),
            dict(when='At payment', icon='split', tag='Two-way split', big='285 / 15',
                 cap='285 to Reem and 5% to the platform.'),
            dict(when='Whenever she wants', icon='bank', tag='Withdraw earnings', big='To the bank account',
                 cap='Reem withdraws her balance to her bank account.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='On top of a monthly subscription the expert pays the platform, such as 99 SAR.',
        totalLabel='Training session', total=300, cur=SAR,
        shares=[dict(who='seller', label='The expert', value=285, pct=95, cur=SAR),
                dict(who='platform', label='The platform', value=15, pct=5, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['kyc', 'sub', 'token', 'split', 'comm', 'ledger', 'payout', 'refund']),

    audience=dict(title=ATITLE,
                  chips=['Consulting', 'Sports coaching', 'Design', 'Content creators',
                         'Private tutoring', 'Professional experts']),

    earn=dict(title='How your platform earns',
              items=['A monthly subscription from every expert',
                     'A percentage of every session or service',
                     'Paid promotion packages inside the platform']),

    close=dict(h2='Launch your own expert marketplace',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


MARKET_BUILDER = {'slug': 'market-builder',
 'crumb': 'Ready marketplace solution',
 'title': 'Ready Marketplace Solution | NX Market Builder',
 'desc': 'NX configures a multi-vendor marketplace under your brand using a ready platform and templates, '
         'with seller management, commissions and financial reporting.',
 'badge': 'A ready solution, configured by NX',
 'kicker': 'NX Market Builder',
 'h1': ['Your own multi-vendor marketplace,', 'built on a ready solution.'],
 'lede': 'NX provides the technology to bring your sellers into one marketplace: a branded storefront, your '
         'own domain, seller management, commissions and balances. We configure the ready platform and '
         'templates around your needs, giving your team one place to manage the business.',
 'cta1': 'Request a solution demo',
 'cta2': 'Explore the solution',
 'fineprint': 'We review the fit for your business, then agree the configuration and launch scope.',
 'phone': {'title': 'Illustrative solution preview',
           'toast': 'Your marketplace brand',
           'amount': 'Your marketplace',
           'cur': '',
           'amountLabel': 'Multi-vendor platform',
           'rows': [('Storefront', 'Your brand'),
                    ('Domain', 'market.client.com'),
                    ('Sellers', 'One platform'),
                    ('Configured by', 'NX')],
           'btn': 'Marketplace management'},
 'story': {'eyebrow': 'What NX delivers',
           'title': 'One platform connecting your marketplace',
           'sub': 'Illustrative example: a business bringing restaurant suppliers together needs a branded '
                  'marketplace. NX configures the ready solution to connect its selling experience with '
                  'seller and revenue management, using the available capabilities.',
           'stops': [{'when': 'Storefront',
                      'icon': 'shop',
                      'tag': 'Your brand presence',
                      'big': 'Your own market',
                      'cap': 'We configure an available template with your brand and domain.'},
                     {'when': 'Sellers',
                      'icon': 'users',
                      'tag': 'Marketplace participants',
                      'big': 'Multiple sellers',
                      'cap': 'The solution supports seller registration, details and onboarding status.'},
                     {'when': 'Administration',
                      'icon': 'id',
                      'tag': 'Your operating team',
                      'big': 'One place to manage',
                      'cap': 'Seller oversight and approval rules come together in one administration '
                             'experience.'},
                     {'when': 'Revenue',
                      'icon': 'chart',
                      'tag': 'Financial visibility',
                      'big': 'Commissions and balances',
                      'cap': 'Financial reports show the marketplace share and amounts due to sellers.'},
                     {'when': 'Payment support',
                      'icon': 'card',
                      'tag': 'Supporting capabilities',
                      'big': 'Part of the solution',
                      'cap': 'We review payment and settlement activation with the available provider.'}]},
 'money': {'eyebrow': 'Revenue within the solution',
           'title': 'A clear view of your marketplace share',
           'sub': 'Commission and seller balance tracking support day-to-day marketplace management. The '
                  'split shown is an arithmetic example; actual rates and payment arrangements depend on the '
                  'configuration scope and provider.',
           'totalLabel': 'Illustrative order value',
           'total': 1000,
           'cur': 'SAR',
           'shares': [{'who': 'seller', 'label': 'Supplier', 'value': 900, 'pct': 90, 'cur': 'SAR'},
                      {'who': 'platform',
                       'label': 'Marketplace owner’s commission',
                       'value': 80,
                       'pct': 8,
                       'cur': 'SAR'},
                      {'who': 'third',
                       'label': 'Other share in this example',
                       'value': 20,
                       'pct': 2,
                       'cur': 'SAR'}]},
 'caps': {'eyebrow': 'Solution capabilities',
          'title': 'The technology behind your marketplace',
          'items': [('Branded storefront',
                     'shop',
                     'We configure the available template with your marketplace name and identity.'),
                    ('Ready templates',
                     'box',
                     'A defined starting point for delivery, assessed for fit before configuration begins.'),
                    ('Marketplace domain',
                     'link',
                     'We connect your marketplace to an address under your own brand.'),
                    ('Seller registration',
                     'users',
                     'A way for sellers to join and provide their details within the marketplace.'),
                    ('Review and approval',
                     'id',
                     'Seller status and approval rules within the available capabilities.'),
                    ('Commission management',
                     'scale',
                     'Configure the marketplace share using the supported revenue settings.'),
                    ('Financial reporting',
                     'chart',
                     'Sales, commissions, balances and amounts due give your team financial visibility.'),
                    ('Payments and settlements',
                     'card',
                     'Supporting capabilities, with activation arrangements agreed with the service '
                     'provider.')]},
 'audience': {'title': 'Choose this solution when…',
              'chips': ['You bring sellers together under one brand',
                        'You want NX to configure the platform',
                        'Ready templates and capabilities fit your needs',
                        'You need one place to manage the market']},
 'earn': {'title': 'How does this differ from Marketplace Engine?',
          'items': ['Starts with a ready platform and templates',
                    'Delivery focuses on configuration and setup',
                    'Available capabilities define the configuration scope'],
          'note': 'NX delivers both solutions. Choose <strong>Market Builder</strong> when the ready '
                  'solution fits your business. For specific interfaces, workflows or integrations, <a '
                  'href="/en/solutions/commerce/marketplace/"><strong>Marketplace Engine</strong></a> is the '
                  'custom project route.'},
 'close': {'h2': 'Your marketplace idea, backed by a ready platform',
           'p': 'We will show you the solution, assess its fit and define what NX will configure under your '
                'brand.',
           'cta': 'Request a solution demo'}}


PAGES = [MARKETPLACE, PAY_SAAS, SERVICES, BOOKING, PAYOUTS, AFFILIATE, FRANCHISE, LOGISTICS,
         EXPERTS, MARKET_BUILDER]


HUB = dict(
    crumb='Commerce Infrastructure',
    title='Commerce & Payments Infrastructure | NX Solutions',
    desc='Ten ready commerce and payment solutions under your brand: marketplaces, embedded payments, bookings, payouts, franchising, logistics and affiliate.',
    badge='NX Commerce Infrastructure',
    kicker='Commerce Infrastructure',
    h1=['One infrastructure for commerce and payments,', 'and ten solutions built on top of it'],
    lede='Every platform that brings more than one party together needs the same things: merchant '
         'onboarding and verification, a sub-account per party, a split at the moment of payment, a '
         'commission for the platform, a clear balance, and payouts. We build that once, and you '
         'launch whichever solution fits your business on top of it.',
    cta1='Book a demo',
    solutionsEyebrow='The solutions',
    solutionsTitle='Ten solutions over the same infrastructure',
    stackEyebrow='Capabilities',
    stackTitle='The capabilities that power all of these solutions',
    stackSub='The same capabilities recur in every solution; what changes is their order and the scenario they serve.',
    catalogue=['kyc', 'sub', 'split', 'comm', 'fees', 'auth', 'payout', 'ledger',
               'refund', 'token'],
    close=dict(h2='Which solution fits your platform?',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)
