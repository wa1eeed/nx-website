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


MARKETPLACE = dict(
    slug='marketplace',
    crumb='Multi-vendor marketplace',
    title='Multi-Vendor Marketplace Platform | NX Solutions',
    desc='Launch your multi-vendor marketplace under your own brand: seller onboarding, split payments at checkout, platform commission, balances and payouts.',
    badge='Marketplace-as-a-Service',
    kicker='NX Marketplace Engine',
    h1=['Your multi-vendor marketplace,', 'ready to launch'],
    lede='Rather than building a marketplace from scratch for every idea, start from an engine '
         'that already runs under your brand: seller onboarding, payment, money splitting, '
         'commission, seller balances and payouts. You focus on the market; we handle the '
         'infrastructure.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Seller dashboard', toast='New 1,000 SAR order distributed',
        amountRaw=8450, cur=SAR, amountLabel='Seller balance',
        rows=[('Total sales', '12,300 SAR'), ('Platform commission', '1,230 SAR'),
              ('Payable', '620 SAR'), ('In settlement', '2,000 SAR')],
        btn='Withdraw earnings',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: Sarah launches a car-parts marketplace',
        sub='Sarah runs a network of car-parts shops and wants to bring them together into one '
            'online marketplace under her own name.',
        stops=[
            dict(when='Day 1', icon='shop', tag='Marketplace launched', big='Sarah’s brand',
                 cap='Sarah launches her marketplace from a ready template with her own identity.'),
            dict(when='Day 3', icon='id', tag='Seller in verification', big='KYB',
                 cap='A parts shop signs up, uploads its commercial registration and follows the verification status inside the platform.'),
            dict(when='Day 4', icon='check', tag='Sub-account live', big='Sub-merchant',
                 cap='Sarah’s team approves the seller, who becomes an independent sub-account and starts selling.'),
            dict(when='Day 10', icon='card', tag='New order', big='1,000 SAR',
                 cap='A customer buys a set of parts and pays once.'),
            dict(when='At payment', icon='split', tag='Automatic split', big='900 / 70 / 30',
                 cap='900 to the seller, 70 platform commission, 30 to the partner — with no manual transfer.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='The percentages are illustrative and are configured to your business model.',
        totalLabel='Marketplace order', total=1000, cur=SAR,
        shares=[dict(who='seller', label='Seller', value=900, pct=90, cur=SAR),
                dict(who='platform', label='Platform commission', value=70, pct=7, cur=SAR),
                dict(who='third', label='Partner', value=30, pct=3, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['kyc', 'sub', 'split', 'comm', 'ledger', 'payout', 'refund', 'fees']),

    audience=dict(title=ATITLE,
                  chips=['Car parts', 'Local producers and home businesses', 'Electronics',
                         'B2B restaurant supplies', 'Fashion', 'Homeware']),

    earn=dict(title='How your marketplace earns',
              items=['Commission on every order', 'Subscription plans for sellers',
                     'Flexible fees by category or plan']),

    close=dict(h2='Your marketplace idea is ready. So is the engine.',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


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


MARKET_BUILDER = dict(
    slug='market-builder',
    crumb='Marketplace builder',
    title='Build a Multi-Vendor Marketplace, No Code | NX Solutions',
    desc='Let anyone launch their own marketplace: a ready template, their own domain and seller invitations — with onboarding, payments and splits handled for them.',
    badge='Multi-vendor Commerce Builder',
    kicker='NX Market Builder',
    h1=['Don’t just build a store,', 'build a whole marketplace'],
    lede='A platform that lets anyone launch their own marketplace: they register, pick a template, '
         'connect their domain, then invite sellers. The infrastructure behind it handles everything '
         'else — seller onboarding, payments, sub-accounts, splits, commissions, balances and payouts.',
    cta1='Book a demo', cta2='Watch the story', fineprint=FINE,

    phone=dict(
        title='Create a new marketplace', toast='Domain connected',
        amount='Khaled’s Market', cur='', amountLabel='Marketplace name',
        rows=[('Domain', 'market.client.com'), ('Template', 'Restaurant supplies'),
              ('Sellers invited', '12'), ('Payments', 'Enabled')],
        btn='Launch the marketplace',
    ),

    story=dict(
        eyebrow=EYE,
        title='Story: Khaled launches his marketplace without a technical team',
        sub='Khaled has an idea for a restaurant-supplies marketplace bringing suppliers and buyers '
            'together, and no technical team of his own.',
        stops=[
            dict(when='Step 1', icon='users', tag='Registration', big='New account',
                 cap='Khaled signs up on the marketplace-builder platform.'),
            dict(when='Step 2', icon='shop', tag='Pick a template', big='B2B',
                 cap='He chooses a marketplace template for suppliers and buyers.'),
            dict(when='Step 3', icon='link', tag='Connect the domain', big='Khaled’s domain',
                 cap='He connects his own domain and branding.'),
            dict(when='Step 4', icon='id', tag='Invite sellers', big='12 suppliers',
                 cap='Suppliers register and go through verification inside the marketplace.'),
            dict(when='Launch', icon='split', tag='First order', big='Split automatically',
                 cap='The first transaction is split between the supplier, Khaled’s commission and the platform fee.'),
        ],
    ),

    money=dict(
        eyebrow=MEYE, title='Every riyal knows where it is going, the moment it is paid',
        sub='The percentages are illustrative, and each marketplace owner sets their own commission.',
        totalLabel='Order in Khaled’s marketplace', total=1000, cur=SAR,
        shares=[dict(who='seller', label='Supplier', value=900, pct=90, cur=SAR),
                dict(who='platform', label='Marketplace owner’s commission', value=80, pct=8, cur=SAR),
                dict(who='third', label='Platform fee', value=20, pct=2, cur=SAR)],
    ),

    caps=dict(eyebrow=CEYE, title=CTITLE,
              ids=['kyc', 'sub', 'split', 'comm', 'fees', 'ledger', 'payout', 'token']),

    audience=dict(title=ATITLE,
                  chips=['Restaurant supplies', 'Home businesses', 'Local services',
                         'Agricultural produce', 'Handicrafts', 'Community and campus markets']),

    earn=dict(title='How your marketplace earns',
              items=['Commission on every order', 'Subscriptions for sellers',
                     'Listing or promotion fees']),

    close=dict(h2='Start your marketplace without a technical team',
               p='Book a demo and we will map out the money-distribution model for your platform with you.'),
)


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
