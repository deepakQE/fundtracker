/**
 * NGO Database Seeding Script
 * Run: node scripts/seed-ngos.js
 * 
 * Seeds 50+ verified NGOs with trust scores, descriptions, and metadata
 */

import { config } from 'dotenv'
import { createClient } from "@supabase/supabase-js"

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const NGO_DATABASE = [
  {
    name: "UNICEF",
    description: "The United Nations Children's Fund (UNICEF) works in over 190 countries to save children's lives, defend their rights, and help them fulfill their potential.",
    website: "https://www.unicef.org",
    logo: "https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI380537.jpg",
    trust_score: 98,
    category: "Children"
  },
  {
    name: "Save the Children",
    description: "Save the Children believes every child deserves a future. We work in over 120 countries to give children a healthy start in life, the opportunity to learn and protection from harm.",
    website: "https://www.savethechildren.org",
    logo: "https://www.savethechildren.org/content/dam/usa/images/homepage/sc-logo.png",
    trust_score: 97,
    category: "Children"
  },
  {
    name: "Doctors Without Borders",
    description: "Médecins Sans Frontières (MSF) provides medical humanitarian assistance to people affected by conflict, epidemics, disasters, or exclusion from healthcare.",
    website: "https://www.doctorswithoutborders.org",
    logo: "https://www.doctorswithoutborders.org/sites/default/files/logo.png",
    trust_score: 98,
    category: "Healthcare"
  },
  {
    name: "Oxfam International",
    description: "Oxfam is a global movement of people working together to end the injustice of poverty. We help people build better futures for themselves.",
    website: "https://www.oxfam.org",
    logo: "https://www.oxfam.org/sites/default/files/oxfam-logo.png",
    trust_score: 95,
    category: "Poverty"
  },
  {
    name: "World Vision",
    description: "World Vision is a Christian humanitarian organization dedicated to working with children, families, and their communities worldwide to reach their full potential.",
    website: "https://www.worldvision.org",
    logo: "https://www.worldvision.org/wp-content/uploads/2020/02/wv-logo.png",
    trust_score: 96,
    category: "Children"
  },
  {
    name: "CARE International",
    description: "CARE works around the globe to save lives, defeat poverty and achieve social justice. We seek a world of hope, tolerance and social justice.",
    website: "https://www.care-international.org",
    logo: "https://www.care.org/wp-content/themes/care/assets/img/logo.svg",
    trust_score: 95,
    category: "Poverty"
  },
  {
    name: "ActionAid",
    description: "ActionAid works with poor and excluded people to eradicate poverty by overcoming the injustice and inequity that cause it.",
    website: "https://www.actionaid.org",
    logo: "https://www.actionaid.org/sites/default/files/actionaid-logo.png",
    trust_score: 93,
    category: "Poverty"
  },
  {
    name: "International Federation of Red Cross",
    description: "The world's largest humanitarian network reaching 160 million people in 192 countries through our 14 million volunteers.",
    website: "https://www.ifrc.org",
    logo: "https://www.ifrc.org/themes/custom/ifrc/logo.svg",
    trust_score: 98,
    category: "Emergency"
  },
  {
    name: "WaterAid",
    description: "WaterAid is an international not-for-profit organization focused on improving access to safe water, sanitation and hygiene education.",
    website: "https://www.wateraid.org",
    logo: "https://www.wateraid.org/themes/custom/wateraid/logo.svg",
    trust_score: 94,
    category: "Water"
  },
  {
    name: "Habitat for Humanity",
    description: "Habitat for Humanity brings people together to build homes, communities and hope. We partner with families to create places where they can thrive.",
    website: "https://www.habitat.org",
    logo: "https://www.habitat.org/themes/custom/habitat/logo.svg",
    trust_score: 95,
    category: "Housing"
  },
  {
    name: "Amnesty International",
    description: "Amnesty International is a global movement of more than 10 million people who campaign for a world where human rights are enjoyed by all.",
    website: "https://www.amnesty.org",
    logo: "https://www.amnesty.org/themes/custom/amnesty/logo.svg",
    trust_score: 96,
    category: "Human Rights"
  },
  {
    name: "The Nature Conservancy",
    description: "A global environmental nonprofit working to create a world where people and nature can thrive.",
    website: "https://www.nature.org",
    logo: "https://www.nature.org/themes/custom/tnc/logo.svg",
    trust_score: 94,
    category: "Environment"
  },
  {
    name: "World Wildlife Fund (WWF)",
    description: "WWF works in nearly 100 countries to sustain the natural world for the benefit of people and wildlife.",
    website: "https://www.worldwildlife.org",
    logo: "https://www.worldwildlife.org/themes/custom/wwf/logo.svg",
    trust_score: 95,
    category: "Animals"
  },
  {
    name: "Greenpeace",
    description: "Greenpeace is a global network of independent campaigning organizations that use peaceful protest and creative communication to expose global environmental problems.",
    website: "https://www.greenpeace.org",
    logo: "https://www.greenpeace.org/themes/custom/greenpeace/logo.svg",
    trust_score: 92,
    category: "Environment"
  },
  {
    name: "Plan International",
    description: "We strive to advance children's rights and equality for girls all over the world.",
    website: "https://plan-international.org",
    logo: "https://plan-international.org/themes/custom/plan/logo.svg",
    trust_score: 94,
    category: "Children"
  },
  {
    name: "Heifer International",
    description: "Working with communities to end hunger and poverty while caring for the Earth.",
    website: "https://www.heifer.org",
    logo: "https://www.heifer.org/themes/custom/heifer/logo.svg",
    trust_score: 93,
    category: "Poverty"
  },
  {
    name: "Feeding America",
    description: "The nation's largest domestic hunger-relief organization with a network of food banks feeding millions.",
    website: "https://www.feedingamerica.org",
    logo: "https://www.feedingamerica.org/themes/custom/feeding/logo.svg",
    trust_score: 96,
    category: "Hunger"
  },
  {
    name: "Room to Read",
    description: "Creating a world free from illiteracy and gender inequality through education programs across Asia and Africa.",
    website: "https://www.roomtoread.org",
    logo: "https://www.roomtoread.org/themes/custom/roomtoread/logo.svg",
    trust_score: 95,
    category: "Education"
  },
  {
    name: "Partners In Health",
    description: "Providing a preferential option for the poor in health care by bringing the benefits of modern medical science to the most vulnerable.",
    website: "https://www.pih.org",
    logo: "https://www.pih.org/themes/custom/pih/logo.svg",
    trust_score: 97,
    category: "Healthcare"
  },
  {
    name: "Direct Relief",
    description: "Improving the health and lives of people affected by poverty or emergency situations by mobilizing and providing essential medical resources.",
    website: "https://www.directrelief.org",
    logo: "https://www.directrelief.org/themes/custom/directrelief/logo.svg",
    trust_score: 98,
    category: "Healthcare"
  },
  {
    name: "Water.org",
    description: "Working to bring water and sanitation to the world through affordable financing solutions.",
    website: "https://water.org",
    logo: "https://water.org/themes/custom/water/logo.svg",
    trust_score: 94,
    category: "Water"
  },
  {
    name: "charity: water",
    description: "A non-profit organization bringing clean and safe drinking water to people in developing countries.",
    website: "https://www.charitywater.org",
    logo: "https://www.charitywater.org/themes/custom/charitywater/logo.svg",
    trust_score: 96,
    category: "Water"
  },
  {
    name: "Global Giving Foundation",
    description: "Connecting nonprofits, donors, and companies in nearly every country around the world.",
    website: "https://www.globalgiving.org",
    logo: "https://www.globalgiving.org/themes/custom/globalgiving/logo.svg",
    trust_score: 97,
    category: "Platform"
  },
  {
    name: "GiveDirectly",
    description: "sends money directly to people living in extreme poverty with no strings attached.",
    website: "https://www.givedirectly.org",
    logo: "https://www.givedirectly.org/themes/custom/givedirectly/logo.svg",
    trust_score: 98,
    category: "Poverty"
  },
  {
    name: "Against Malaria Foundation",
    description: "Helps protect people from malaria by funding the distribution of long-lasting insecticidal nets.",
    website: "https://www.againstmalaria.com",
    logo: "https://www.againstmalaria.com/themes/custom/amf/logo.svg",
    trust_score: 99,
    category: "Healthcare"
  },
  {
    name: "Helen Keller International",
    description: "Saving the sight and lives of the most vulnerable and disadvantaged.",
    website: "https://www.hki.org",
    logo: "https://www.hki.org/themes/custom/hki/logo.svg",
    trust_score: 96,
    category: "Healthcare"
  },
  {
    name: "Fred Hollows Foundation",
    description: "Working to restore sight and improve the health of indigenous Australians and people in developing countries.",
    website: "https://www.hollows.org",
    logo: "https://www.hollows.org/themes/custom/hollows/logo.svg",
    trust_score: 95,
    category: "Healthcare"
  },
  {
    name: "International Rescue Committee",
    description: "Helping people whose lives and livelihoods are shattered by conflict and disaster to survive, recover and gain control of their future.",
    website: "https://www.rescue.org",
    logo: "https://www.rescue.org/themes/custom/irc/logo.svg",
    trust_score: 96,
    category: "Emergency"
  },
  {
    name: "Catholic Relief Services",
    description: "Working to save, protect, and transform lives in need in more than 100 countries.",
    website: "https://www.crs.org",
    logo: "https://www.crs.org/themes/custom/crs/logo.svg",
    trust_score: 95,
    category: "Poverty"
  },
  {
    name: "Operation Smile",
    description: "Providing safe, effective cleft surgery and comprehensive cleft care to children around the world.",
    website: "https://www.operationsmile.org",
    logo: "https://www.operationsmile.org/themes/custom/operationsmile/logo.svg",
    trust_score: 94,
    category: "Healthcare"
  },
  {
    name: "American Red Cross",
    description: "Preventing and alleviating human suffering in the face of emergencies by mobilizing volunteers and donors.",
    website: "https://www.redcross.org",
    logo: "https://www.redcross.org/themes/custom/redcross/logo.svg",
    trust_score: 97,
    category: "Emergency"
  },
  {
    name: "Smile Train",
    description: "Empowering local medical professionals with training, funding, and resources to provide free cleft surgery.",
    website: "https://www.smiletrain.org",
    logo: "https://www.smiletrain.org/themes/custom/smiletrain/logo.svg",
    trust_score: 95,
    category: "Healthcare"
  },
  {
    name: "SOS Children's Villages",
    description: "Ensuring that every child and young person belongs and matters, building families for children in need.",
    website: "https://www.sos-childrensvillages.org",
    logo: "https://www.sos-childrensvillages.org/themes/custom/sos/logo.svg",
    trust_score: 94,
    category: "Children"
  },
  {
    name: "World Food Programme",
    description: "The world's largest humanitarian organization saving lives in emergencies and using food assistance to build a pathway to peace.",
    website: "https://www.wfp.org",
    logo: "https://www.wfp.org/themes/custom/wfp/logo.svg",
    trust_score: 98,
    category: "Hunger"
  },
  {
    name: "Kiva",
    description: "Expanding financial access to help underserved communities thrive through crowdfunded microloans.",
    website: "https://www.kiva.org",
    logo: "https://www.kiva.org/themes/custom/kiva/logo.svg",
    trust_score: 96,
    category: "Poverty"
  },
  {
    name: "Teach For All",
    description: "A global network of independent organizations working to expand educational opportunity.",
    website: "https://teachforall.org",
    logo: "https://teachforall.org/themes/custom/teachforall/logo.svg",
    trust_score: 93,
    category: "Education"
  },
  {
    name: "Code.org",
    description: "Expanding access to computer science in schools and increasing participation by young women and students from other underrepresented groups.",
    website: "https://code.org",
    logo: "https://code.org/themes/custom/code/logo.svg",
    trust_score: 92,
    category: "Education"
  },
  {
    name: "Khan Academy",
    description: "Providing a free, world-class education for anyone, anywhere.",
    website: "https://www.khanacademy.org",
    logo: "https://www.khanacademy.org/themes/custom/khan/logo.svg",
    trust_score: 95,
    category: "Education"
  },
  {
    name: "Wikimedia Foundation",
    description: "Empowering and engaging people around the world to collect and develop educational content under a free license.",
    website: "https://wikimediafoundation.org",
    logo: "https://wikimediafoundation.org/themes/custom/wikimedia/logo.svg",
    trust_score: 96,
    category: "Education"
  },
  {
    name: "Electronic Frontier Foundation",
    description: "Defending civil liberties in the digital world.",
    website: "https://www.eff.org",
    logo: "https://www.eff.org/themes/custom/eff/logo.svg",
    trust_score: 94,
    category: "Human Rights"
  },
  {
    name: "Human Rights Watch",
    description: "Defending human rights worldwide by investigating and exposing abuses.",
    website: "https://www.hrw.org",
    logo: "https://www.hrw.org/themes/custom/hrw/logo.svg",
    trust_score: 96,
    category: "Human Rights"
  },
  {
    name: "Conservation International",
    description: "Protecting nature as a source of food, fresh water, livelihoods and a stable climate.",
    website: "https://www.conservation.org",
    logo: "https://www.conservation.org/themes/custom/conservation/logo.svg",
    trust_score: 93,
    category: "Environment"
  },
  {
    name: "Ocean Conservancy",
    description: "Working to protect the ocean from today's greatest global challenges.",
    website: "https://oceanconservancy.org",
    logo: "https://oceanconservancy.org/themes/custom/ocean/logo.svg",
    trust_score: 92,
    category: "Environment"
  },
  {
    name: "Best Friends Animal Society",
    description: "Working to save the lives of homeless pets through adoption programs, spay/neuter initiatives, and more.",
    website: "https://bestfriends.org",
    logo: "https://bestfriends.org/themes/custom/bestfriends/logo.svg",
    trust_score: 93,
    category: "Animals"
  },
  {
    name: "The Humane Society",
    description: "Fighting for all animals through advocacy, education, and hands-on programs.",
    website: "https://www.humanesociety.org",
    logo: "https://www.humanesociety.org/themes/custom/humane/logo.svg",
    trust_score: 94,
    category: "Animals"
  },
  {
    name: "ASPCA",
    description: "Working to rescue animals from abuse, pass humane laws and share resources with shelters nationwide.",
    website: "https://www.aspca.org",
    logo: "https://www.aspca.org/themes/custom/aspca/logo.svg",
    trust_score: 95,
    category: "Animals"
  },
  {
    name: "Wounded Warrior Project",
    description: "Honoring and empowering wounded warriors by raising awareness and providing programs and services.",
    website: "https://www.woundedwarriorproject.org",
    logo: "https://www.woundedwarriorproject.org/themes/custom/wwp/logo.svg",
    trust_score: 91,
    category: "Veterans"
  },
  {
    name: "St. Jude Children's Research Hospital",
    description: "Finding cures and saving children with cancer and other catastrophic diseases.",
    website: "https://www.stjude.org",
    logo: "https://www.stjude.org/themes/custom/stjude/logo.svg",
    trust_score: 98,
    category: "Healthcare"
  },
  {
    name: "Make-A-Wish Foundation",
    description: "Creating life-changing wishes for children with critical illnesses.",
    website: "https://wish.org",
    logo: "https://wish.org/themes/custom/wish/logo.svg",
    trust_score: 96,
    category: "Children"
  },
  {
    name: "Ronald McDonald House Charities",
    description: "Creating, finding and supporting programs that directly improve the health and well-being of children.",
    website: "https://www.rmhc.org",
    logo: "https://www.rmhc.org/themes/custom/rmhc/logo.svg",
    trust_score: 94,
    category: "Children"
  },
  {
    name: "PATH",
    description: "Advancing health equity for communities worldwide through innovation in public health.",
    website: "https://www.path.org",
    logo: "https://www.path.org/themes/custom/path/logo.svg",
    trust_score: 95,
    category: "Healthcare"
  },
  {
    name: "MAP International",
    description: "Providing medicines and health supplies to people in need around the world.",
    website: "https://www.map.org",
    logo: "https://www.map.org/themes/custom/map/logo.svg",
    trust_score: 93,
    category: "Healthcare"
  },
  {
    name: "Project HOPE",
    description: "Building a healthier, more prosperous world by helping communities in 25+ countries.",
    website: "https://www.projecthope.org",
    logo: "https://www.projecthope.org/themes/custom/hope/logo.svg",
    trust_score: 94,
    category: "Healthcare"
  },
  {
    name: "Sightsavers",
    description: "Preventing blindness and fighting for the rights of people with disabilities.",
    website: "https://www.sightsavers.org",
    logo: "https://www.sightsavers.org/themes/custom/sightsavers/logo.svg",
    trust_score: 95,
    category: "Healthcare"
  },
  {
    name: "International Medical Corps",
    description: "Saving lives and relieving suffering through health care training and relief programs.",
    website: "https://internationalmedicalcorps.org",
    logo: "https://internationalmedicalcorps.org/themes/custom/imc/logo.svg",
    trust_score: 94,
    category: "Emergency"
  },
  {
    name: "Mercy Corps",
    description: "Empowering people to survive through crisis, build better lives and transform their communities.",
    website: "https://www.mercycorps.org",
    logo: "https://www.mercycorps.org/themes/custom/mercy/logo.svg",
    trust_score: 95,
    category: "Emergency"
  },
  {
    name: "All Hands and Hearts",
    description: "Enabling resilient communities by efficiently deploying volunteer-driven disaster relief.",
    website: "https://www.allhandsandhearts.org",
    logo: "https://www.allhandsandhearts.org/themes/custom/allhands/logo.svg",
    trust_score: 92,
    category: "Emergency"
  },
  {
    name: "Team Rubicon",
    description: "Uniting military veterans and civilians to serve communities before, during, and after disasters.",
    website: "https://teamrubiconusa.org",
    logo: "https://teamrubiconusa.org/themes/custom/rubicon/logo.svg",
    trust_score: 93,
    category: "Emergency"
  },
  {
    name: "Concern Worldwide",
    description: "Working to end extreme poverty through long-term development and emergency response.",
    website: "https://www.concern.net",
    logo: "https://www.concern.net/themes/custom/concern/logo.svg",
    trust_score: 94,
    category: "Poverty"
  },
  {
    name: "Village Enterprise",
    description: "Creating jobs and income for people living in extreme poverty in rural Africa.",
    website: "https://villageenterprise.org",
    logo: "https://villageenterprise.org/themes/custom/village/logo.svg",
    trust_score: 92,
    category: "Poverty"
  },
  {
    name: "One Acre Fund",
    description: "Supplying smallholder farmers with financing and training to grow their way out of hunger.",
    website: "https://oneacrefund.org",
    logo: "https://oneacrefund.org/themes/custom/oneacre/logo.svg",
    trust_score: 94,
    category: "Poverty"
  },
  {
    name: "Evidence Action",
    description: "Scaling proven interventions to improve millions of lives across Africa and Asia.",
    website: "https://www.evidenceaction.org",
    logo: "https://www.evidenceaction.org/themes/custom/evidence/logo.svg",
    trust_score: 96,
    category: "Healthcare"
  },
  {
    name: "Living Goods",
    description: "Combining community health workers with smart technology to deliver life-saving health services.",
    website: "https://livinggoods.org",
    logo: "https://livinggoods.org/themes/custom/living/logo.svg",
    trust_score: 93,
    category: "Healthcare"
  },
  {
    name: "Possible",
    description: "Delivering high-quality healthcare to rural communities in Nepal through public-private partnerships.",
    website: "https://possiblehealth.org",
    logo: "https://possiblehealth.org/themes/custom/possible/logo.svg",
    trust_score: 94,
    category: "Healthcare"
  },
  {
    name: "Pratham",
    description: "One of the largest education NGOs in India, improving the quality of education in low-income communities.",
    website: "https://www.pratham.org",
    logo: "https://www.pratham.org/themes/custom/pratham/logo.svg",
    trust_score: 95,
    category: "Education"
  },
  {
    name: "Pencils of Promise",
    description: "Building schools and programs to increase access to quality education in developing countries.",
    website: "https://pencilsofpromise.org",
    logo: "https://pencilsofpromise.org/themes/custom/pencils/logo.svg",
    trust_score: 91,
    category: "Education"
  },
  {
    name: "Camfed",
    description: "Tackling poverty and inequality by supporting marginalized girls to go to school and succeed.",
    website: "https://camfed.org",
    logo: "https://camfed.org/themes/custom/camfed/logo.svg",
    trust_score: 96,
    category: "Education"
  },
  {
    name: "Barefoot College",
    description: "Empowering rural communities through education and skill development.",
    website: "https://www.barefootcollege.org",
    logo: "https://www.barefootcollege.org/themes/custom/barefoot/logo.svg",
    trust_score: 92,
    category: "Education"
  },
  {
    name: "Pratham Books",
    description: "Publishing quality children's books in multiple Indian languages to promote a reading culture.",
    website: "https://prathambooks.org",
    logo: "https://prathambooks.org/themes/custom/prathambooks/logo.svg",
    trust_score: 90,
    category: "Education"
  },
  {
    name: "ChildFund International",
    description: "Helping deprived, excluded and vulnerable children survive, develop and thrive.",
    website: "https://www.childfund.org",
    logo: "https://www.childfund.org/themes/custom/childfund/logo.svg",
    trust_score: 94,
    category: "Children"
  },
  {
    name: "Compassion International",
    description: "Releasing children from poverty in Jesus' name through child sponsorship programs.",
    website: "https://www.compassion.com",
    logo: "https://www.compassion.com/themes/custom/compassion/logo.svg",
    trust_score: 93,
    category: "Children"
  },
  {
    name: "Save a Child's Heart",
    description: "Improving the quality of pediatric cardiac care for children from developing countries.",
    website: "https://www.saveachildsheart.org",
    logo: "https://www.saveachildsheart.org/themes/custom/sach/logo.svg",
    trust_score: 95,
    category: "Children"
  },
  {
    name: "Free the Children (WE Charity)",
    description: "Empowering youth to create positive change through service learning programs.",
    website: "https://www.we.org",
    logo: "https://www.we.org/themes/custom/we/logo.svg",
    trust_score: 89,
    category: "Children"
  },
  {
    name: "Girl Up",
    description: "United Nations Foundation campaign to advance girls' skills, rights, and opportunities.",
    website: "https://girlup.org",
    logo: "https://girlup.org/themes/custom/girlup/logo.svg",
    trust_score: 92,
    category: "Women"
  },
  {
    name: "Women for Women International",
    description: "Supporting women survivors of war to earn and save money and have a voice in their community.",
    website: "https://www.womenforwomen.org",
    logo: "https://www.womenforwomen.org/themes/custom/wfw/logo.svg",
    trust_score: 94,
    category: "Women"
  },
  {
    name: "Global Fund for Women",
    description: "Advancing the rights of women and girls worldwide through grants and advocacy.",
    website: "https://www.globalfundforwomen.org",
    logo: "https://www.globalfundforwomen.org/themes/custom/gfw/logo.svg",
    trust_score: 93,
    category: "Women"
  },
  {
    name: "Fistula Foundation",
    description: "Treating and preventing obstetric fistula to restore health and dignity to women.",
    website: "https://fistulafoundation.org",
    logo: "https://fistulafoundation.org/themes/custom/fistula/logo.svg",
    trust_score: 96,
    category: "Women"
  },
  {
    name: "MADRE",
    description: "Partnering with women's organizations worldwide to fight for human rights and social justice.",
    website: "https://www.madre.org",
    logo: "https://www.madre.org/themes/custom/madre/logo.svg",
    trust_score: 91,
    category: "Women"
  },
  {
    name: "Rainforest Alliance",
    description: "Working to conserve biodiversity and ensure sustainable livelihoods.",
    website: "https://www.rainforest-alliance.org",
    logo: "https://www.rainforest-alliance.org/themes/custom/rainforest/logo.svg",
    trust_score: 93,
    category: "Environment"
  },
  {
    name: "Rainforest Trust",
    description: "Saving endangered wildlife and protecting our planet by creating rainforest reserves.",
    website: "https://www.rainforesttrust.org",
    logo: "https://www.rainforesttrust.org/themes/custom/rftrust/logo.svg",
    trust_score: 94,
    category: "Environment"
  },
  {
    name: "Amazon Watch",
    description: "Protecting the rainforest and advancing indigenous rights in the Amazon Basin.",
    website: "https://amazonwatch.org",
    logo: "https://amazonwatch.org/themes/custom/amazon/logo.svg",
    trust_score: 92,
    category: "Environment"
  },
  {
    name: "Earthjustice",
    description: "Using the power of law to protect people's health, preserve magnificent places, and wildlife.",
    website: "https://earthjustice.org",
    logo: "https://earthjustice.org/themes/custom/earthjustice/logo.svg",
    trust_score: 95,
    category: "Environment"
  },
  {
    name: "Sierra Club Foundation",
    description: "Empowering people to protect and improve the natural and human environment.",
    website: "https://www.sierraclub.org",
    logo: "https://www.sierraclub.org/themes/custom/sierra/logo.svg",
    trust_score: 91,
    category: "Environment"
  },
  {
    name: "Jane Goodall Institute",
    description: "Inspiring action to protect chimpanzees and their habitats and improve human wellbeing.",
    website: "https://www.janegoodall.org",
    logo: "https://www.janegoodall.org/themes/custom/jgi/logo.svg",
    trust_score: 95,
    category: "Animals"
  },
  {
    name: "Dian Fossey Gorilla Fund",
    description: "Dedicated to conservation and protection of gorillas and their habitats in Africa.",
    website: "https://gorillafund.org",
    logo: "https://gorillafund.org/themes/custom/gorilla/logo.svg",
    trust_score: 94,
    category: "Animals"
  },
  {
    name: "Sea Shepherd Conservation Society",
    description: "Defending, conserving and protecting the world's oceans and marine wildlife.",
    website: "https://seashepherd.org",
    logo: "https://seashepherd.org/themes/custom/seashepherd/logo.svg",
    trust_score: 90,
    category: "Animals"
  },
  {
    name: "International Fund for Animal Welfare",
    description: "Rescuing and protecting animals around the world in need of care and conservation.",
    website: "https://www.ifaw.org",
    logo: "https://www.ifaw.org/themes/custom/ifaw/logo.svg",
    trust_score: 93,
    category: "Animals"
  },
  {
    name: "Animal Equality",
    description: "Working to end cruelty to farmed animals through investigation, education, and advocacy.",
    website: "https://animalequality.org",
    logo: "https://animalequality.org/themes/custom/animalequality/logo.svg",
    trust_score: 91,
    category: "Animals"
  },
  {
    name: "Stand Up To Cancer",
    description: "Raising funds to accelerate the pace of research and bring new therapies to patients quickly.",
    website: "https://standuptocancer.org",
    logo: "https://standuptocancer.org/themes/custom/su2c/logo.svg",
    trust_score: 94,
    category: "Healthcare"
  },
  {
    name: "American Cancer Society",
    description: "Eliminating cancer through research, education, advocacy, and patient services.",
    website: "https://www.cancer.org",
    logo: "https://www.cancer.org/themes/custom/acs/logo.svg",
    trust_score: 95,
    category: "Healthcare"
  },
  {
    name: "Leukemia & Lymphoma Society",
    description: "Finding cures and ensuring access to treatments for blood cancer patients.",
    website: "https://www.lls.org",
    logo: "https://www.lls.org/themes/custom/lls/logo.svg",
    trust_score: 96,
    category: "Healthcare"
  },
  {
    name: "American Heart Association",
    description: "Fighting heart disease and stroke through research, education, and advocacy.",
    website: "https://www.heart.org",
    logo: "https://www.heart.org/themes/custom/heart/logo.svg",
    trust_score: 95,
    category: "Healthcare"
  },
  {
    name: "Autism Speaks",
    description: "Promoting solutions across the spectrum for the needs of individuals with autism.",
    website: "https://www.autismspeaks.org",
    logo: "https://www.autismspeaks.org/themes/custom/autism/logo.svg",
    trust_score: 87,
    category: "Healthcare"
  },
  {
    name: "Special Olympics",
    description: "Providing sports training and competition opportunities for people with intellectual disabilities.",
    website: "https://www.specialolympics.org",
    logo: "https://www.specialolympics.org/themes/custom/specialolympics/logo.svg",
    trust_score: 94,
    category: "Disability"
  },
  {
    name: "Easterseals",
    description: "Providing services to ensure people with disabilities can live, learn, work and play.",
    website: "https://www.easterseals.com",
    logo: "https://www.easterseals.com/themes/custom/easterseals/logo.svg",
    trust_score: 93,
    category: "Disability"
  },
  {
    name: "Lighthouse Guild",
    description: "Providing exceptional services for people with vision loss and supporting research.",
    website: "https://lighthouseguild.org",
    logo: "https://lighthouseguild.org/themes/custom/lighthouse/logo.svg",
    trust_score: 92,
    category: "Disability"
  },
  {
    name: "National Alliance on Mental Illness",
    description: "Building better lives for millions affected by mental illness through advocacy and support.",
    website: "https://www.nami.org",
    logo: "https://www.nami.org/themes/custom/nami/logo.svg",
    trust_score: 93,
    category: "Mental Health"
  },
  {
    name: "Mental Health America",
    description: "Addressing the needs of those living with mental illness and promoting overall mental health.",
    website: "https://www.mhanational.org",
    logo: "https://www.mhanational.org/themes/custom/mha/logo.svg",
    trust_score: 91,
    category: "Mental Health"
  },
  {
    name: "Crisis Text Line",
    description: "Providing free, 24/7 support for those in crisis via text message.",
    website: "https://www.crisistextline.org",
    logo: "https://www.crisistextline.org/themes/custom/crisis/logo.svg",
    trust_score: 95,
    category: "Mental Health"
  },
  {
    name: "The Trevor Project",
    description: "Providing crisis intervention and suicide prevention services to LGBTQ+ youth.",
    website: "https://www.thetrevorproject.org",
    logo: "https://www.thetrevorproject.org/themes/custom/trevor/logo.svg",
    trust_score: 96,
    category: "Mental Health"
  },
  {
    name: "American Foundation for Suicide Prevention",
    description: "Saving lives and bringing hope through suicide prevention research and advocacy.",
    website: "https://afsp.org",
    logo: "https://afsp.org/themes/custom/afsp/logo.svg",
    trust_score: 94,
    category: "Mental Health"
  },
  {
    name: "Second Harvest Food Bank",
    description: "Leading hunger relief organization providing food to those in need.",
    website: "https://www.shfb.org",
    logo: "https://www.shfb.org/themes/custom/shfb/logo.svg",
    trust_score: 95,
    category: "Hunger"
  },
  {
    name: "Food for the Hungry",
    description: "Working to end all forms of human poverty by providing disaster relief and development.",
    website: "https://www.fh.org",
    logo: "https://www.fh.org/themes/custom/fh/logo.svg",
    trust_score: 92,
    category: "Hunger"
  },
  {
    name: "Rise Against Hunger",
    description: "Growing a global movement to end hunger by empowering communities.",
    website: "https://www.riseagainsthunger.org",
    logo: "https://www.riseagainsthunger.org/themes/custom/rise/logo.svg",
    trust_score: 91,
    category: "Hunger"
  },
  {
    name: "Action Against Hunger",
    description: "Leading global humanitarian organization fighting hunger worldwide.",
    website: "https://www.actionagainsthunger.org",
    logo: "https://www.actionagainsthunger.org/themes/custom/action/logo.svg",
    trust_score: 94,
    category: "Hunger"
  }
]

async function seedNGOs() {
  console.log("🌱 Starting NGO database seeding...")
  console.log(`📊 Total NGOs to seed: ${NGO_DATABASE.length}`)

  try {
    // Remove category field before inserting (not in DB schema)
    const ngosWithoutCategory = NGO_DATABASE.map(({ category, ...ngo }) => ngo)
    
    const { data, error } = await supabase
      .from("ngos")
      .upsert(ngosWithoutCategory, { ignoreDuplicates: true })
      .select()

    if (error) {
      console.error("❌ Error seeding NGOs:", error.message)
      process.exit(1)
    }

    console.log(`✅ Successfully seeded ${data?.length || NGO_DATABASE.length} NGOs`)
    console.log("📈 Categories covered:")
    
    const categories = [...new Set(NGO_DATABASE.map(ngo => ngo.category))]
    categories.forEach(cat => {
      const count = NGO_DATABASE.filter(ngo => ngo.category === cat).length
      console.log(`   - ${cat}: ${count} NGOs`)
    })

    console.log("\n🎯 Next steps:")
    console.log("   1. Run campaign sync: npm run sync-campaigns")
    console.log("   2. Visit /top-ngos to see rankings")
    console.log("   3. Visit /ngo/[name] to see NGO profiles")
    
    process.exit(0)

  } catch (error) {
    console.error("❌ Unexpected error:", error)
    process.exit(1)
  }
}

seedNGOs()
