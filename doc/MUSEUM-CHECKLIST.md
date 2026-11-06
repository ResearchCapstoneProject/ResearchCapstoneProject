# What the museum needs to provide and decide

Everything on this list is something the website is waiting for and that only
the Department of National Museum and Monuments can supply: an account, a
decision, or a text to approve. Nothing here needs a developer.

The grouping is by consequence, not by subject: the first section is what
stands between the site and going live.

## 1. Before the site can go public

**Approve the imprint and the privacy notice.** Both pages currently carry a
banner saying that the text was drafted by the project team and has not been
reviewed by the museum. We wrote them from what the website actually does, but
they are legal statements in the museum's name, so somebody at the museum has
to read them and say yes — or send us corrections. The banner disappears when
the site goes live.

**Name a retention period for booking data.** A booking holds a visitor's
name, e-mail address, usually a phone number and the day they were in the
building. The privacy notice says the period "still has to be set by the
museum", and that is exactly true: the site keeps bookings until somebody
names a number of days, after which they are deleted automatically. 90 days
after the visit is a defensible default; the decision is the museum's, and the
privacy notice then states whatever is set.

**Decide where the website lives, and who administers it.** It runs today on a
server the project team set up, which is fine for a demonstration and not a
home. The question is whether the museum's or the government's IT takes it
over, and on what machine. `doc/DEPLOY.md` is written for whoever that is.

**A decision about the domain.** The department already has one:
`national-museum.gov.bw`. The question is whether the new site may live on it,
or on a name under it, and who can change its DNS entries. With a name instead
of a bare IP address, the encrypted connection (HTTPS) becomes routine instead
of the experimental route we have to use for an address without a name. It
also means a printed QR code keeps working if the server ever moves — and the
same DNS access is what the e-mail in section 2 needs.

**Change the first administrator password**, and tell us who should have an
account and in which of the three roles: *administrator* (everything,
including prices and appearance), *curator* (objects, events, publications,
texts, pictures) or *front desk* (bookings and check-in, nothing else).

**Who approves content and who is our contact**, so the handover has a name on
the museum's side.

## 2. Needed, so that placeholders can go

**A mail address on the museum's own domain**, and whoever can change that
domain's DNS entries. Confirmation e-mails already work: they go out from
`botswana-national-museum@gmx.net`, a mailbox the project team set up so
that nothing waits on the museum. What that mailbox cannot do is prove it
speaks for the museum — a free mailbox has no SPF, DKIM or DMARC of its own,
so some confirmations will land in spam folders, and no sending service can
repair that while the sender address is a free one. Two things change it: a
role address on `national-museum.gov.bw`, such as `tickets@` or `no-reply@`,
and somebody who can add the DNS records for it. The second is the one that
tends to stall, so it is worth asking for by name. Until then the site keeps
sending from the project mailbox, and a visitor who replies reaches whichever
museum address is set as the reply-to.

**The collection register.** The 60 objects of *Art and Crafts of Botswana*
are in the site with their catalogue pages, but their accession numbers,
measurements and gallery locations are placeholders. A sample export from
whatever the museum uses today — paper register, Excel, collection software —
lets us match the real fields instead of guessing them.

**Which objects or details must not be public**: sacred or culturally
sensitive objects, human remains, anything needing community consent, and
whether storage locations or values may be shown at all. This is the one piece
of content where a wrong guess by us is a real problem.

**Photographs and their rights.** Who owns the images, who may take new ones,
and whether the museum's own photos may go on the website. Pictures can be
replaced in the staff area at any time, so this does not block anything — it
decides what is shown until then.

**Opening hours** (including last entry, public holidays and closure days) and
**admission**: today everything is free and there is a single visitor group.
If citizens, residents, children, students and international visitors pay
different amounts, the museum enters the groups and prices in the staff area —
or tells us and we enter them once.

**Languages.** The site is English. If Setswana is wanted, somebody has to
translate, and we need to know whether that is one text per page or the whole
site.

## 3. Settings the museum decides, which take one minute each

All of these are in the staff area under Settings, and can be changed any time
without us:

- how many visitors one time slot holds (today 40),
- how long a slot is (today 60 minutes; 15 to 120 are possible),
- how far ahead visitors may book (today 14 days),
- and the retention period from section 1.

The records the project invented so the site could be shown before the museum
had entered anything — sample bookings, a generated scan history, and the
notes saying that none of it was real — have been removed. Nothing on the
site is sample content any more; every number it shows is one the museum's
own records produced.

## 4. Two practical warnings

**Print the QR labels last.** Each label contains the website's address. If
the labels are printed while the site is reachable only at the current IP
address, and the museum later moves to a domain name, every printed label
points at the old address. Decide the address first, print after.

**The website needs a backup, and that is a server task.** Nothing in the
software can protect the museum's records against the machine being lost;
`doc/DEPLOY.md` has the two commands and a daily schedule for whoever
administers the server.

## What the museum does not need to ask us for any more

Colours, typefaces, the logo, the picture on the home page, the footer, every
photograph on the content pages, every text the site carries as content,
events, publications, visitor groups and prices, slot length and capacity:
all of that is editable in the staff area, by museum staff, without a
developer. That was the point of the last weeks.
