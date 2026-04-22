export interface KathaChapter {
  title: string;
  body: string;
}

export interface ChapteredKatha {
  chapters: KathaChapter[];
  phalaShruti?: string;
  closingMantra?: string;
}

export const KATHA_CLOSING_MANTRAS: Record<string, string> = {
  ekadashi:  "Jai Ekadashi Mata Ki Jai.\nOm Namo Bhagavate Vasudevaya.",
  pradosh:   "Om Namah Shivaya.\nHar Har Mahadev.",
  amavasya:  "Om Pitru Devaya Namaha.\nOm Namo Bhagavate Vasudevaya.",
  sankashti: "Om Gan Ganapataye Namaha.\nOm Vakratundaya Hum.",
  purnima:   "Jai Lakshmi Ramana\nShri Satyanarayan Swami Ki Jai.",
  "ekadashi-nirjala": "Jai Bhimseni Ekadashi Ki Jai.\nOm Namo Bhagavate Vasudevaya.",
  navratri:  "Jai Mata Di. Om Dum Durgayai Namaha.",
  "karva-chauth": "Karva Chauth Mubarak. Om Shivaya Parvatipataye Namaha.",
  "maha-shivratri": "Om Namah Shivaya. Har Har Mahadev.",
  janmashtami: "Jai Shri Krishna. Om Namo Bhagavate Vasudevaya.",
  "vat-savitri": "Om Savitri Devi Namaha. Pati Deerghaayu Kaamnaa.",
};

export const VRAT_KATHAS: Record<string, string | ChapteredKatha> = {

  ekadashi: `Once the sage Narada Muni asked Lord Vishnu — "O Lord, what is the greatest vrat a devotee can observe?" Lord Vishnu replied — "Narada, of all vrats Ekadashi is the most sacred. On this day a demon named Mura hid inside grains and pulses to corrupt the minds of humans. When devotees avoid grains on Ekadashi they starve this demon and protect their soul from impurity. I am most pleased by this fast above all others."

Narada asked — "Who first observed this vrat?" Lord Vishnu smiled and said — "Long ago a demon named Mura terrorised the heavens and my realm. I fought him for a thousand years and grew weary. I rested in a cave called Badarikashram. From my own divine energy a beautiful maiden emerged — born of my exhaustion and my shakti — and while I slept she fought Mura alone and slew him. When I awoke and saw what she had done I granted her a boon.

She said — Lord, give me a name and let those who fast on the day of my birth be freed from all sin. I named her Ekadashi — she who was born on the eleventh day. I blessed her thus: Whoever fasts on Ekadashi shall be freed from the cycle of birth and death. Their devotion shall reach me directly. The sins of seven lifetimes shall be washed away in a single Ekadashi fast observed with pure heart and full devotion.

This is why Ekadashi is the most beloved fast among all Vaishnavas. It comes twice every lunar month — on the eleventh day of the waxing moon and the eleventh day of the waning moon. Each Ekadashi carries its own name and its own special blessing.

Observe it with devotion, stay awake in prayer if you can, and Lord Vishnu himself will hold you in his heart."`,

  "ekadashi-nirjala": `The Pandava Bhima was known for his enormous appetite and great love of food. When the sage Vyasa instructed the Pandavas to observe all 24 Ekadashis of the year, Bhima was in despair. He told Vyasa — "O sage, I can fight a thousand demons but I cannot fast even for a single day. My digestive fire burns constantly and hunger is unbearable for me. What shall I do?"

Vyasa smiled with compassion. He said — "Bhima, there is one Ekadashi so powerful that observing it earns the merit of all 24 Ekadashis combined. It is called Nirjala Ekadashi — the waterless fast. It falls on the eleventh day of the waxing fortnight in the month of Jyeshtha. Fast strictly on this day — not even a drop of water — and you will receive the full blessings of every Ekadashi in the year."

Bhima observed Nirjala Ekadashi faithfully and completely. At the end of the fast, Lord Vishnu himself appeared before him and blessed him. He said — "Bhima, your one day of complete renunciation has given you the fruit of a year of devotion. Those who observe this fast will be purified of all sins. At the time of death, my messengers — not Yama's — shall come for them."

This is why Nirjala Ekadashi is also called Bhimseni Ekadashi and is considered the most powerful fast in the Vaishnava calendar. It is the hardest fast, but it carries the greatest reward.`,

  pradosh: `Long ago the gods and demons churned the cosmic ocean — the Samudra Manthan — to obtain Amrit, the nectar of immortality. They used Mount Mandara as the churning rod and the great serpent Vasuki as the rope. They churned for a thousand years.

During the churning a deadly poison called Halahala emerged first — so powerful that its fumes alone began to destroy all creation. The gods and demons stopped in terror. The heavens shook. Lord Brahma himself fled. The gods ran to Lord Shiva in desperation.

Without hesitation Lord Shiva stepped forward. He cupped the Halahala in his palm and swallowed it in one motion — holding it in his throat so the poison could not reach his heart nor return to the world. His throat turned deep blue from the power of the poison — earning him the name Neelakantha, the blue-throated one. Goddess Parvati pressed her hand to his throat to prevent the poison from descending further.

He saved all creation at great personal cost, bearing the burn of the world's poison silently and without complaint.

The gods were so overcome with gratitude that they gathered at the Pradosh Kaal — the sacred twilight hour between day and night, the time when Shiva had acted — and worshipped him with flowers, bilva leaves, milk, and the deepest devotion. Lord Shiva was immensely pleased.

He declared — "Whoever worships me at this twilight time on the trayodashi tithi shall be freed from all troubles. Their sins shall be washed away. The childless shall receive children. The sick shall be healed. The poor shall find wealth. I am most easily pleased at this hour when day and night meet."

This is why Pradosh Vrat is observed twice each lunar month. We worship Shiva at sunset — the hour when he swallowed the poison of the world so that we might live in peace.`,

  navratri: `In ancient times there was a powerful demon king named Mahishasura. He had performed severe penance and received a boon from Lord Brahma — that no man or god could kill him. With this boon he became arrogant and began terrorising the three worlds. He defeated the gods and threw them out of Swarga.

The gods went to Lord Brahma, then to Lord Vishnu, then to Lord Shiva in desperation. From the combined divine energy of all the gods a great light emerged — golden, blinding, magnificent. From this light the divine mother was born — Goddess Durga — riding a lion, carrying weapons in her ten arms, radiant with the power of all creation.

The gods offered her their weapons — Vishnu gave his Sudarshana Chakra, Shiva gave his trishul, Indra gave his vajra, Varuna gave his conch. Armed with divine power Goddess Durga fought Mahishasura for nine days and nine nights. The demon changed forms — from buffalo to lion to elephant to man — but the goddess was relentless.

On the ninth day she pierced him with her trishul and destroyed him. The three worlds were freed. The gods sang her praises and the nine days of battle became Navratri — the nine nights of the divine mother.

Each of the nine days is dedicated to one of her nine forms: Day 1 Shailputri, Day 2 Brahmacharini, Day 3 Chandraghanta, Day 4 Kushmanda, Day 5 Skandamata, Day 6 Katyayani, Day 7 Kalaratri, Day 8 Mahagauri, Day 9 Siddhidatri.

Devotees who fast for all nine days with devotion receive her blessings of strength, courage, prosperity and liberation. Jai Mata Di. Om Dum Durgayei Namaha.`,

  "karva-chauth": `Long ago there was a beautiful and devoted woman named Veeravati. She was the only sister of seven loving brothers. After her marriage she came to her parents home for her first Karva Chauth. She observed the nirjala fast — no food, no water from sunrise.

By evening she was weak with hunger and thirst. Her seven brothers could not bear to see their sister suffer. They lit a fire behind a hill and held up a mirror to make it look like the moon had risen. "Sister, the moon has risen — you can break your fast!" they called out. Veeravati, trusting her brothers, broke her fast.

The moment she did — news came that her husband had died. Devastated she ran to her husband's home. On the way the goddess Indrani appeared and revealed what her brothers had done.

Veeravati prayed and wept for a year. The next Karva Chauth she observed the fast perfectly — not a drop of water, not a morsel of food — until she sighted the real moon. Her devotion was so pure that her husband was restored to life.

From that day Karva Chauth became the most sacred fast for married women — a vow of love and devotion so powerful it conquers even death. Always wait for the real moon. Never be deceived. Your devotion is your husband's protection. Karva Chauth Mubarak. Om Namah Shivaya.`,

  "maha-shivratri": `Long ago there was a poor hunter named Gurudruha who lived in the forest. One Shivratri night he went hunting but found no animals. Exhausted and hungry he climbed a Bilva tree near a Shiva Lingam to wait for animals to come to the water below.

Through the night — without knowing it — he dropped Bilva leaves onto the Shiva Lingam below. He also shed tears of exhaustion that fell on the lingam. He fasted through the night without intending to.

At dawn a deer came to drink water. As Gurudruha raised his bow the deer spoke — "Please do not kill me now. Let me go home and say goodbye to my family. I promise I will return." The hunter, moved by compassion, let it go. Three more deer came and each made the same promise. Each time the hunter let them go.

By releasing them with compassion — and having unknowingly offered Bilva leaves, tears and a night-long fast to Lord Shiva — the hunter had performed the complete Shivratri puja without knowing it. Lord Shiva was so pleased that when the hunter died his messengers came to take him to Vaikuntha. The hunter who had never prayed consciously received moksha through the grace of Shivratri.

Lord Shiva then declared — "Whoever fasts on Shivratri, stays awake through the night, and offers Bilva leaves to my lingam — even unknowingly — I grant them liberation from the cycle of birth and death."

Om Namah Shivaya. Har Har Mahadev.`,

  janmashtami: `On the eighth day of the dark fortnight in the month of Bhadrapada, in the prison of King Kansa in Mathura, a divine light filled the cell where Devaki and Vasudeva were imprisoned. Kansa had imprisoned his own sister Devaki and her husband because a divine prophecy said their eighth child would destroy him. He had killed seven of their children.

But on this night the eighth child was born — Lord Krishna — glowing with divine light, holding a conch and a lotus, wearing a crown of peacock feathers. The moment he was born the prison guards fell asleep, the chains fell off Vasudeva's hands, and the prison doors opened on their own.

Vasudeva wrapped the newborn Krishna and carried him through the night, crossing the flooding Yamuna river. The river parted as Krishna's feet touched the water. Vasudeva placed the baby with Nanda and Yashoda in Gokul and returned with their newborn daughter.

When Kansa came to kill the eighth child, the baby girl slipped from his hands, rose into the sky and declared — "The one who will destroy you is already born and safe, O Kansa." Krishna grew up in Gokul, performed divine miracles, and fulfilled the prophecy.

Devotees fast on Janmashtami until midnight — the hour of Krishna's birth — and break their fast with panchamrit after the midnight puja. Fasting on this day with devotion brings Krishna's blessings of joy, wisdom, and liberation.

Om Namo Bhagavate Vasudevaya. Jai Shri Krishna.`,

  "vat-savitri": `Savitri was so beautiful and so accomplished that no man was brave enough to ask for her hand. Her father sent her to choose her own husband. She traveled the forests and returned with her heart given — to Satyavan, a prince living as a forest hermit after his father lost his kingdom and his sight.

The sage Narada told her father in sorrow — Satyavan is blessed in every way, but the stars say he will die exactly one year from today. Her father begged her to choose another. Savitri replied — I have given my heart. I will give it only once.

She married Satyavan and served his blind parents in the forest with complete devotion for one year. When the fateful day came, she accompanied her husband to the forest to cut wood. He grew faint and laid his head in her lap. Yama arrived on his buffalo with his golden noose.

Savitri rose and followed Yama southward, speaking words of such profound dharmic wisdom that even the god of death had to stop and listen. Three times he offered her boons, each time telling her she could not have her husband back. Each time she asked for something that unknowingly required Satyavan to be alive — eyesight for her father-in-law, his kingdom restored, a hundred sons for her own father. When Yama granted the last boon he realised his mistake.

He laughed with great joy and returned Satyavan to her. "You are the truest of all devoted wives," he said. "Satyavan lives."

Women tie thread around the banyan tree — the tree of eternal life — and pray for their husband's longevity. The banyan is the witness to Savitri's love that conquered death itself.`,

  sankashti: `Once all the gods held a great race — whoever circled the entire universe first would receive a divine modak, Lord Ganesha's favourite sweet, as the prize. Lord Indra mounted his white elephant Airavata. Lord Kartikeya leapt onto his peacock. All the gods sped off at once, racing across the fourteen worlds and the seven oceans.

Lord Ganesha looked at his vehicle — a small mouse named Mushika — and was quiet for a moment. Then he smiled with quiet wisdom. Instead of racing across the universe he walked slowly and lovingly around his parents Lord Shiva and Goddess Parvati three times. He bowed to them with folded hands and stood still.

When the gods returned exhausted from their great journey, Ganesha was already seated, peacefully eating his modak. The gods protested — "How can you have won? You never left!"

Ganesha replied — "My father Shiva is the consciousness that pervades all creation. My mother Parvati is the divine energy that animates all existence. To circle them with love and devotion is to circle the universe itself — for they contain it entirely. What greater pilgrimage is there than the feet of one's own parents? What greater universe is there than one's own home?"

Lord Shiva and Goddess Parvati were moved to tears of joy. Ganesha was declared the winner. The gods fell silent in humility and in awe.

We worship Lord Ganesha on Sankashti Chaturthi — the fourth lunar day in the waning fortnight — and we break our fast only after sighting the moon. He who removed all obstacles not with speed or strength but with wisdom, devotion, and love.`,

  amavasya: `In ancient times there was a devoted son named Shravan Kumar who loved his parents above all else. His elderly parents were blind and had always longed to visit the sacred tirthas of India. Shravan Kumar fashioned a wooden frame with two large baskets — one on each end of a pole — and carried his parents on his own shoulders across the length and breadth of the land, fulfilling their every wish.

One evening, near the forest of Ayodhya, his parents grew thirsty. Shravan Kumar set the frame down carefully beneath a tree and walked to the nearby river Saryu to fill a clay pot with water. The sound of water entering the pot echoed in the quiet night.

King Dasharatha — father of Lord Rama — was practicing Shabdbhedi Baan that night, the royal art of releasing an arrow guided by sound alone. He heard what he believed was an animal drinking at the river. He drew his bow in the darkness and released.

The arrow struck Shravan Kumar who cried out in great pain. Dasharatha rushed to him in horror. The dying boy said — "It is not your arrow that has ended me, O King. It is my own karma. But please, take this water to my parents who are waiting thirsty in the forest. Tell them gently what has happened. Do not let them die without water."

Dasharatha carried the water to the blind old parents and told them the truth, his voice breaking. When they heard what had happened, neither could bear the grief. The father said — "Bring me to my son." Dasharatha carried him to where Shravan Kumar lay. The father laid his hands on his son's face and blessed him. Then both parents gave up their lives from grief.

With his dying breath the father cursed Dasharatha — "As I am dying consumed by grief for my son, you too shall die consumed by grief for your own son." This curse came to pass many years later — Dasharatha died in great sorrow when Lord Rama was sent into exile.

We honour our ancestors on Amavasya with water, sesame seeds, and the tarpan prayer. The pitru — our ancestors — are said to be most accessible to receive and to bless us on this new moon day. As Shravan Kumar carried his parents with pure love, we carry their memory forward with devotion and gratitude.`,

  purnima: {
    chapters: [
      {
        title: "Chapter 1 — Origin of the Vrat",
        body: "Narada Muni travels to Earth and sees humans suffering greatly in Kalyug. He visits Lord Vishnu and asks how people can find relief from their misery. Lord Vishnu reveals the Satyanarayan Vrat — the simplest path to peace and prosperity — and instructs Narada to share it with the world.",
      },
      {
        title: "Chapter 2 — The Poor Brahmin and the Woodcutter",
        body: "Lord Vishnu appears as an old Brahmin and instructs a poor Brahmin to perform the Satyanarayan puja. After doing so faithfully, the Brahmin overcomes all his obstacles and finds joy. A woodcutter witnesses this transformation and performs the puja himself — receiving the same blessings and abundance.",
      },
      {
        title: "Chapter 3 — The Merchant who broke his vow",
        body: "A wealthy merchant promises to perform the Satyanarayan puja after his child is born but repeatedly delays and forgets his vow. The Lord holds him accountable — the merchant is falsely accused and imprisoned. His devoted wife performs the puja with sincerity, the Lord shows mercy, and the merchant is freed.",
      },
      {
        title: "Chapter 4 — The importance of Prasad",
        body: "Continuing from Chapter 3 — the merchant's wife and daughter rush to greet him at the dockyard without first accepting the prasad. The Lord is displeased and the ship sinks. It rises again only when the wife and daughter humbly accept and eat the prasad — teaching that prasad must never be disrespected or refused.",
      },
      {
        title: "Chapter 5 — King Tungadhwaj and the Phala Shruti",
        body: "A king named Tungadhwaj goes hunting in the forest and comes upon cowherds performing Satyanarayan puja with great devotion. Out of pride he neither joins them nor bows to the Lord. When offered prasad he refuses and walks away. Upon returning to his kingdom he finds all his sons dead and his wealth gone — the consequence of disrespecting the Lord's prasad. Realising his mistake he returns, humbly performs the puja and accepts the prasad with full devotion. All is restored. He attains happiness in this life and moksha after death.",
      },
    ],
    phalaShruti:
      "Lord Vishnu declares: Whoever hears or reads this Katha with devotion shall be freed from all sins. One who is childless shall be blessed with children. One who is without wealth shall gain prosperity. One who is imprisoned shall be freed. One who is fearful shall be liberated from fear. A widow who observes this vrat with devotion shall be blessed with a good husband in her next birth. One who performs this puja with a pure heart shall enjoy all earthly pleasures and attain moksha after death.",
    closingMantra: "Jai Lakshmi Ramana\nShri Satyanarayan Swami Ki Jai.",
  },
};

export function getVratKatha(id: string): string | ChapteredKatha | undefined {
  if (id === "ekadashi-jun-1") return VRAT_KATHAS["ekadashi-nirjala"];
  if (id.startsWith("ekadashi"))  return VRAT_KATHAS["ekadashi"];
  if (id.startsWith("pradosh"))   return VRAT_KATHAS["pradosh"];
  if (id.startsWith("navratri"))  return VRAT_KATHAS["navratri"];
  if (id === "karva-chauth")      return VRAT_KATHAS["karva-chauth"];
  if (id === "maha-shivratri")    return VRAT_KATHAS["maha-shivratri"];
  if (id === "janmashtami")       return VRAT_KATHAS["janmashtami"];
  if (id === "vat-savitri")       return VRAT_KATHAS["vat-savitri"];
  if (id.startsWith("sankashti")) return VRAT_KATHAS["sankashti"];
  if (id.startsWith("purnima"))   return VRAT_KATHAS["purnima"];
  if (id.startsWith("amavasya"))  return VRAT_KATHAS["amavasya"];
  return undefined;
}

export function getKathaKey(id: string): string {
  if (id === "ekadashi-jun-1")    return "ekadashi-nirjala";
  if (id.startsWith("ekadashi"))  return "ekadashi";
  if (id.startsWith("pradosh"))   return "pradosh";
  if (id.startsWith("navratri"))  return "navratri";
  if (id === "karva-chauth")      return "karva-chauth";
  if (id === "maha-shivratri")    return "maha-shivratri";
  if (id === "janmashtami")       return "janmashtami";
  if (id === "vat-savitri")       return "vat-savitri";
  if (id.startsWith("sankashti")) return "sankashti";
  if (id.startsWith("purnima"))   return "purnima";
  if (id.startsWith("amavasya"))  return "amavasya";
  return id;
}
