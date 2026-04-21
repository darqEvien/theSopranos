export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  titleTr: string;
  description: string;
  airDate: string;
  introStart: number;  // saniye
  introEnd: number;    // saniye
  videoFileName: string;
}

export interface Season {
  number: number;
  title: string;
  titleTr: string;
  description: string;
  year: string;
  episodeCount: number;
  episodes: Episode[];
}

// Video dosya ismi helper — dosya isimlendirmenize göre değiştirin
function vid(s: number, e: number): string {
  const ss = String(s).padStart(2, '0');
  const ee = String(e).padStart(2, '0');
  return `S${ss}E${ee}.mp4`;
}

function epId(s: number, e: number): string {
  return `s${s}e${e}`;
}

export const seasons: Season[] = [
  {
    number: 1,
    title: 'Season 1',
    titleTr: 'Sezon 1',
    description: 'Tony Soprano, New Jersey mafya patronu olmanın baskılarıyla başa çıkmaya çalışırken bir psikiyatriste gitmeye başlar.',
    year: '1999',
    episodeCount: 13,
    episodes: [
      { id: epId(1, 1), season: 1, episode: 1, title: 'The Sopranos', titleTr: 'Pilot', description: 'Tony Soprano panik atak geçirir ve psikiyatrist Dr. Melfi ile terapi seanslarına başlar.', airDate: '1999-01-10', introStart: 0, introEnd: 35, videoFileName: vid(1, 1) },
      { id: epId(1, 2), season: 1, episode: 2, title: '46 Long', titleTr: '46 Uzunluğunda', description: 'Christopher ve Brendan bir kamyon soygununa karışır. Tony annesiyle ilgilenmek zorunda kalır.', airDate: '1999-01-17', introStart: 0, introEnd: 35, videoFileName: vid(1, 2) },
      { id: epId(1, 3), season: 1, episode: 3, title: 'Denial, Anger, Acceptance', titleTr: 'İnkar, Öfke, Kabul', description: 'Jackie Aprile\'in kanseri kötüleşir. Christopher ilk cinayetini işler.', airDate: '1999-01-24', introStart: 0, introEnd: 35, videoFileName: vid(1, 3) },
      { id: epId(1, 4), season: 1, episode: 4, title: 'Meadowlands', titleTr: 'Meadowlands', description: 'Tony terapisinin ailesi tarafından öğrenilmesinden korkar.', airDate: '1999-01-31', introStart: 0, introEnd: 35, videoFileName: vid(1, 4) },
      { id: epId(1, 5), season: 1, episode: 5, title: 'College', titleTr: 'Üniversite', description: 'Tony kızı Meadow ile üniversite gezisindeyken eski bir muhbirle karşılaşır.', airDate: '1999-02-07', introStart: 0, introEnd: 35, videoFileName: vid(1, 5) },
      { id: epId(1, 6), season: 1, episode: 6, title: 'Pax Soprana', titleTr: 'Pax Soprana', description: 'Junior resmi olarak patron olur ama Tony perde arkasından yönetmeye devam eder.', airDate: '1999-02-14', introStart: 0, introEnd: 35, videoFileName: vid(1, 6) },
      { id: epId(1, 7), season: 1, episode: 7, title: 'Down Neck', titleTr: 'Mahalle', description: 'A.J.\'nin okulda başı belaya girer. Tony çocukluğunu hatırlar.', airDate: '1999-02-21', introStart: 0, introEnd: 35, videoFileName: vid(1, 7) },
      { id: epId(1, 8), season: 1, episode: 8, title: 'The Legend of Tennessee Moltisanti', titleTr: 'Tennessee Moltisanti Efsanesi', description: 'Christopher kendini bir filmde ölümsüzleştirmek ister.', airDate: '1999-02-28', introStart: 0, introEnd: 35, videoFileName: vid(1, 8) },
      { id: epId(1, 9), season: 1, episode: 9, title: 'Boca', titleTr: 'Boca', description: 'Junior\'ın özel hayatı dedikodu konusu olur. Meadow\'un futbol koçuyla ilgili sorun ortaya çıkar.', airDate: '1999-03-07', introStart: 0, introEnd: 35, videoFileName: vid(1, 9) },
      { id: epId(1, 10), season: 1, episode: 10, title: 'A Hit Is a Hit', titleTr: 'Bir Vuruş Bir Vuruştur', description: 'Christopher müzik endüstrisine girmeye çalışır. Tony zenginlerle sosyalleşir.', airDate: '1999-03-14', introStart: 0, introEnd: 35, videoFileName: vid(1, 10) },
      { id: epId(1, 11), season: 1, episode: 11, title: 'Nobody Knows Anything', titleTr: 'Kimse Bir Şey Bilmiyor', description: 'Pussy\'nin FBI muhbiri olduğuna dair şüpheler ortaya çıkar.', airDate: '1999-03-21', introStart: 0, introEnd: 35, videoFileName: vid(1, 11) },
      { id: epId(1, 12), season: 1, episode: 12, title: 'Isabella', titleTr: 'Isabella', description: 'Tony derin bir depresyona girer ve suikast girişimiyle karşı karşıya kalır.', airDate: '1999-03-28', introStart: 0, introEnd: 35, videoFileName: vid(1, 12) },
      { id: epId(1, 13), season: 1, episode: 13, title: 'I Dream of Jeannie Cusamano', titleTr: 'Jeannie Cusamano\'yu Hayal Ediyorum', description: 'Tony annesinin ve Junior\'ın kendisine karşı komplo kurduğunu öğrenir.', airDate: '1999-04-04', introStart: 0, introEnd: 35, videoFileName: vid(1, 13) },
    ],
  },
  {
    number: 2,
    title: 'Season 2',
    titleTr: 'Sezon 2',
    description: 'Pussy geri döner, Tony\'nin kız kardeşi Janice sahneye çıkar ve iç çatışmalar derinleşir.',
    year: '2000',
    episodeCount: 13,
    episodes: [
      { id: epId(2, 1), season: 2, episode: 1, title: "Guy Walks into a Psychiatrist's Office...", titleTr: 'Bir Adam Psikiyatristin Ofisine Girer...', description: 'Tony\'nin kuzenlerinden Philly ve fedaisi ortaya çıkar.', airDate: '2000-01-16', introStart: 0, introEnd: 35, videoFileName: vid(2, 1) },
      { id: epId(2, 2), season: 2, episode: 2, title: 'Do Not Resuscitate', titleTr: 'Canlandırmayın', description: 'Junior cezaevinden çıkar ve ev hapsine alınır.', airDate: '2000-01-23', introStart: 0, introEnd: 35, videoFileName: vid(2, 2) },
      { id: epId(2, 3), season: 2, episode: 3, title: 'Toodle-Fucking-Oo', titleTr: 'Hoşça Kal', description: 'Janice New Jersey\'ye taşınır ve ailede huzursuzluk yaratır.', airDate: '2000-01-30', introStart: 0, introEnd: 35, videoFileName: vid(2, 3) },
      { id: epId(2, 4), season: 2, episode: 4, title: 'Commendatori', titleTr: 'Commendatori', description: 'Tony, Paulie ve Christopher İtalya\'ya iş gezisine gider.', airDate: '2000-02-06', introStart: 0, introEnd: 35, videoFileName: vid(2, 4) },
      { id: epId(2, 5), season: 2, episode: 5, title: "Big Girls Don't Cry", titleTr: 'Büyük Kızlar Ağlamaz', description: 'Tony terapide ilerleme kaydetmeye çalışır.', airDate: '2000-02-13', introStart: 0, introEnd: 35, videoFileName: vid(2, 5) },
      { id: epId(2, 6), season: 2, episode: 6, title: 'The Happy Wanderer', titleTr: 'Mutlu Gezgin', description: 'Tony yüksek bahisli bir poker oyunu düzenler.', airDate: '2000-02-20', introStart: 0, introEnd: 35, videoFileName: vid(2, 6) },
      { id: epId(2, 7), season: 2, episode: 7, title: 'D-Girl', titleTr: 'D-Girl', description: 'Christopher Hollywood\'a adım atar.', airDate: '2000-02-27', introStart: 0, introEnd: 35, videoFileName: vid(2, 7) },
      { id: epId(2, 8), season: 2, episode: 8, title: 'Full Leather Jacket', titleTr: 'Deri Ceket', description: 'Richie Aprile Tony\'ye karşı destek toplamaya çalışır.', airDate: '2000-03-05', introStart: 0, introEnd: 35, videoFileName: vid(2, 8) },
      { id: epId(2, 9), season: 2, episode: 9, title: 'From Where to Eternity', titleTr: 'Sonsuzluğa Kadar', description: 'Christopher ölümden döner ve öte tarafı gördüğünü söyler.', airDate: '2000-03-12', introStart: 0, introEnd: 35, videoFileName: vid(2, 9) },
      { id: epId(2, 10), season: 2, episode: 10, title: 'Bust Out', titleTr: 'İflas', description: 'Tony bir spor mağazasını sömürmeye başlar.', airDate: '2000-03-19', introStart: 0, introEnd: 35, videoFileName: vid(2, 10) },
      { id: epId(2, 11), season: 2, episode: 11, title: 'House Arrest', titleTr: 'Ev Hapsi', description: 'Junior ev hapsinde bunalır. Tony meşru bir iş aramaya başlar.', airDate: '2000-03-26', introStart: 0, introEnd: 35, videoFileName: vid(2, 11) },
      { id: epId(2, 12), season: 2, episode: 12, title: 'The Knight in White Satin Armor', titleTr: 'Beyaz Saten Zırhlı Şövalye', description: 'Richie Aprile\'ın kaderi belirlenir.', airDate: '2000-04-02', introStart: 0, introEnd: 35, videoFileName: vid(2, 12) },
      { id: epId(2, 13), season: 2, episode: 13, title: 'Funhouse', titleTr: 'Eğlence Evi', description: 'Tony sezonu sarsan büyük bir karar vermek zorunda kalır.', airDate: '2000-04-09', introStart: 0, introEnd: 35, videoFileName: vid(2, 13) },
    ],
  },
  {
    number: 3,
    title: 'Season 3',
    titleTr: 'Sezon 3',
    description: 'Ralph Cifaretto sahneye çıkar, Tony ve Carmela\'nın evliliği sarsılır.',
    year: '2001',
    episodeCount: 13,
    episodes: [
      { id: epId(3, 1), season: 3, episode: 1, title: "Mr. Ruggerio's Neighborhood", titleTr: 'Bay Ruggerio\'nun Mahallesi', description: 'FBI Tony\'nin evini dinlemeye almaya çalışır.', airDate: '2001-03-04', introStart: 0, introEnd: 35, videoFileName: vid(3, 1) },
      { id: epId(3, 2), season: 3, episode: 2, title: 'Proshai, Livushka', titleTr: 'Elveda, Livushka', description: 'Soprano ailesinde önemli bir kayıp yaşanır.', airDate: '2001-03-04', introStart: 0, introEnd: 35, videoFileName: vid(3, 2) },
      { id: epId(3, 3), season: 3, episode: 3, title: 'Fortunate Son', titleTr: 'Şanslı Oğul', description: 'Christopher resmen capo adayı olur. Jackie Jr. sahneye çıkar.', airDate: '2001-03-11', introStart: 0, introEnd: 35, videoFileName: vid(3, 3) },
      { id: epId(3, 4), season: 3, episode: 4, title: 'Employee of the Month', titleTr: 'Ayın Çalışanı', description: 'Dr. Melfi travmatik bir olay yaşar.', airDate: '2001-03-18', introStart: 0, introEnd: 35, videoFileName: vid(3, 4) },
      { id: epId(3, 5), season: 3, episode: 5, title: 'Another Toothpick', titleTr: 'Bir Kürdan Daha', description: 'Tony yol öfkesi yaşar. Bobby Baccalieri\'nin babası ortaya çıkar.', airDate: '2001-03-25', introStart: 0, introEnd: 35, videoFileName: vid(3, 5) },
      { id: epId(3, 6), season: 3, episode: 6, title: 'University', titleTr: 'Üniversite', description: 'Ralph Cifaretto\'nun şiddeti yeni boyutlara ulaşır.', airDate: '2001-04-01', introStart: 0, introEnd: 35, videoFileName: vid(3, 6) },
      { id: epId(3, 7), season: 3, episode: 7, title: 'Second Opinion', titleTr: 'İkinci Görüş', description: 'Carmela terapiye gider ve sert gerçeklerle yüzleşir.', airDate: '2001-04-08', introStart: 0, introEnd: 35, videoFileName: vid(3, 7) },
      { id: epId(3, 8), season: 3, episode: 8, title: 'He Is Risen', titleTr: 'O Dirildi', description: 'Tony Ralph\'la hesaplaşmak zorunda kalır.', airDate: '2001-04-15', introStart: 0, introEnd: 35, videoFileName: vid(3, 8) },
      { id: epId(3, 9), season: 3, episode: 9, title: 'The Telltale Moozadell', titleTr: 'Ele Veren Moozadell', description: 'Jackie Jr. suç dünyasına daha fazla girer.', airDate: '2001-04-22', introStart: 0, introEnd: 35, videoFileName: vid(3, 9) },
      { id: epId(3, 10), season: 3, episode: 10, title: '...To Save Us All from Satan\'s Power', titleTr: 'Şeytanın Gücünden Bizi Kurtarmak İçin', description: 'Noel zamanı, geçmiş Noeller hatırlanır.', airDate: '2001-04-29', introStart: 0, introEnd: 35, videoFileName: vid(3, 10) },
      { id: epId(3, 11), season: 3, episode: 11, title: 'Pine Barrens', titleTr: 'Çam Ormanları', description: 'Paulie ve Christopher New Jersey ormanlarında mahsur kalır. Efsanevi bölüm.', airDate: '2001-05-06', introStart: 0, introEnd: 35, videoFileName: vid(3, 11) },
      { id: epId(3, 12), season: 3, episode: 12, title: 'Amour Fou', titleTr: 'Çılgın Aşk', description: 'Gloria Trillo krize girer. Jackie Jr.\'ın kaderi belirlenir.', airDate: '2001-05-13', introStart: 0, introEnd: 35, videoFileName: vid(3, 12) },
      { id: epId(3, 13), season: 3, episode: 13, title: 'Army of One', titleTr: 'Tek Kişilik Ordu', description: 'Sezon finali — Jackie Jr.\'ın sonu ve A.J.\'nin geleceği.', airDate: '2001-05-20', introStart: 0, introEnd: 35, videoFileName: vid(3, 13) },
    ],
  },
  {
    number: 4,
    title: 'Season 4',
    titleTr: 'Sezon 4',
    description: 'Tony ve Carmela\'nın evliliği çatırdamaya başlar, iş dünyasında yeni zorluklar.',
    year: '2002',
    episodeCount: 13,
    episodes: [
      { id: epId(4, 1), season: 4, episode: 1, title: 'For All Debts Public and Private', titleTr: 'Tüm Borçlar İçin', description: 'Yeni sezon, Christopher babasının katilini arar.', airDate: '2002-09-15', introStart: 0, introEnd: 35, videoFileName: vid(4, 1) },
      { id: epId(4, 2), season: 4, episode: 2, title: 'No Show', titleTr: 'Görünmez', description: 'Christopher ve Adriana\'nın ilişkisi gerginleşir.', airDate: '2002-09-22', introStart: 0, introEnd: 35, videoFileName: vid(4, 2) },
      { id: epId(4, 3), season: 4, episode: 3, title: 'Christopher', titleTr: 'Christopher', description: 'Kolomb Günü kutlamaları tartışmalara yol açar.', airDate: '2002-09-29', introStart: 0, introEnd: 35, videoFileName: vid(4, 3) },
      { id: epId(4, 4), season: 4, episode: 4, title: 'The Weight', titleTr: 'Ağırlık', description: 'Johnny Sack Ralph hakkında intikam planlar.', airDate: '2002-10-06', introStart: 0, introEnd: 35, videoFileName: vid(4, 4) },
      { id: epId(4, 5), season: 4, episode: 5, title: 'Pie-O-My', titleTr: 'Pie-O-My', description: 'Tony bir yarış atına bağlanır.', airDate: '2002-10-13', introStart: 0, introEnd: 35, videoFileName: vid(4, 5) },
      { id: epId(4, 6), season: 4, episode: 6, title: 'Everybody Hurts', titleTr: 'Herkes Acı Çeker', description: 'Artie Bucco Tony\'den borç alır.', airDate: '2002-10-20', introStart: 0, introEnd: 35, videoFileName: vid(4, 6) },
      { id: epId(4, 7), season: 4, episode: 7, title: 'Watching Too Much Television', titleTr: 'Çok Fazla Televizyon', description: 'Adriana FBI baskısı altında ezilir.', airDate: '2002-10-27', introStart: 0, introEnd: 35, videoFileName: vid(4, 7) },
      { id: epId(4, 8), season: 4, episode: 8, title: 'Mergers and Acquisitions', titleTr: 'Birleşme ve Satın Alma', description: 'Tony yeni bir ilişkiye başlar.', airDate: '2002-11-03', introStart: 0, introEnd: 35, videoFileName: vid(4, 8) },
      { id: epId(4, 9), season: 4, episode: 9, title: 'Whoever Did This', titleTr: 'Bunu Kim Yaptıysa', description: 'Ralph Cifaretto\'nun kaderi belirlenir. Efsanevi bölüm.', airDate: '2002-11-10', introStart: 0, introEnd: 35, videoFileName: vid(4, 9) },
      { id: epId(4, 10), season: 4, episode: 10, title: 'The Strong, Silent Type', titleTr: 'Güçlü, Sessiz Tip', description: 'Christopher\'ın bağımlılığı kriz noktasına ulaşır.', airDate: '2002-11-17', introStart: 0, introEnd: 35, videoFileName: vid(4, 10) },
      { id: epId(4, 11), season: 4, episode: 11, title: 'Calling All Cars', titleTr: 'Tüm Araçları Çağırın', description: 'Tony ve Carmela\'nın evliliği kırılma noktasına gelir.', airDate: '2002-11-24', introStart: 0, introEnd: 35, videoFileName: vid(4, 11) },
      { id: epId(4, 12), season: 4, episode: 12, title: 'Eloise', titleTr: 'Eloise', description: 'Carmela ve Furio arasındaki gerilim artar.', airDate: '2002-12-01', introStart: 0, introEnd: 35, videoFileName: vid(4, 12) },
      { id: epId(4, 13), season: 4, episode: 13, title: 'Whitecaps', titleTr: 'Beyaz Köpükler', description: 'Tony ve Carmela\'nın evliliği çöker. Unutulmaz sezon finali.', airDate: '2002-12-08', introStart: 0, introEnd: 35, videoFileName: vid(4, 13) },
    ],
  },
  {
    number: 5,
    title: 'Season 5',
    titleTr: 'Sezon 5',
    description: 'Tony Blundetto geri döner, Tony ve Carmela ayrı yaşar, Adriana\'nın FBI sorunu büyür.',
    year: '2004',
    episodeCount: 13,
    episodes: [
      { id: epId(5, 1), season: 5, episode: 1, title: 'Two Tonys', titleTr: 'İki Tony', description: 'Tony B hapisten çıkar. Tony ve Carmela ayrı yaşamaktadır.', airDate: '2004-03-07', introStart: 0, introEnd: 35, videoFileName: vid(5, 1) },
      { id: epId(5, 2), season: 5, episode: 2, title: 'Rat Pack', titleTr: 'Sıçan Sürüsü', description: 'FBI baskıları yoğunlaşır.', airDate: '2004-03-14', introStart: 0, introEnd: 35, videoFileName: vid(5, 2) },
      { id: epId(5, 3), season: 5, episode: 3, title: "Where's Johnny?", titleTr: 'Johnny Nerede?', description: 'Junior\'ın zihinsel sağlığı kötüleşir.', airDate: '2004-03-21', introStart: 0, introEnd: 35, videoFileName: vid(5, 3) },
      { id: epId(5, 4), season: 5, episode: 4, title: 'All Happy Families...', titleTr: 'Tüm Mutlu Aileler...', description: 'Tony B yeni hayatına uyum sağlamaya çalışır.', airDate: '2004-03-28', introStart: 0, introEnd: 35, videoFileName: vid(5, 4) },
      { id: epId(5, 5), season: 5, episode: 5, title: 'Irregular Around the Margins', titleTr: 'Kenarlarında Düzensiz', description: 'Tony ve Adriana hakkında dedikodular yayılır.', airDate: '2004-04-04', introStart: 0, introEnd: 35, videoFileName: vid(5, 5) },
      { id: epId(5, 6), season: 5, episode: 6, title: 'Sentimental Education', titleTr: 'Duygusal Eğitim', description: 'Carmela yeni bir ilişki dener.', airDate: '2004-04-11', introStart: 0, introEnd: 35, videoFileName: vid(5, 6) },
      { id: epId(5, 7), season: 5, episode: 7, title: 'In Camelot', titleTr: 'Camelot\'ta', description: 'Tony babasının eski metresini bulur.', airDate: '2004-04-18', introStart: 0, introEnd: 35, videoFileName: vid(5, 7) },
      { id: epId(5, 8), season: 5, episode: 8, title: 'Marco Polo', titleTr: 'Marco Polo', description: 'Tony ve Carmela yakınlaşmaya başlar.', airDate: '2004-04-25', introStart: 0, introEnd: 35, videoFileName: vid(5, 8) },
      { id: epId(5, 9), season: 5, episode: 9, title: 'Unidentified Black Males', titleTr: 'Kimliği Belirsiz Siyah Erkekler', description: 'Tony B eski alışkanlıklarına geri döner.', airDate: '2004-05-02', introStart: 0, introEnd: 35, videoFileName: vid(5, 9) },
      { id: epId(5, 10), season: 5, episode: 10, title: 'Cold Cuts', titleTr: 'Soğuk Kesimler', description: 'Janice öfke yönetimi terapisine gider. Tony B krize girer.', airDate: '2004-05-09', introStart: 0, introEnd: 35, videoFileName: vid(5, 10) },
      { id: epId(5, 11), season: 5, episode: 11, title: 'The Test Dream', titleTr: 'Test Rüyası', description: 'Tony uzun ve garip bir rüya görür. Efsanevi bölüm.', airDate: '2004-05-16', introStart: 0, introEnd: 35, videoFileName: vid(5, 11) },
      { id: epId(5, 12), season: 5, episode: 12, title: 'Long Term Parking', titleTr: 'Uzun Süreli Park', description: 'Adriana\'nın kaderi belirlenir. Dizinin en yıkıcı bölümlerinden biri.', airDate: '2004-05-23', introStart: 0, introEnd: 35, videoFileName: vid(5, 12) },
      { id: epId(5, 13), season: 5, episode: 13, title: 'All Due Respect', titleTr: 'Tüm Saygılarımla', description: 'Tony B\'nin sonu. Johnny Sack ile gerilim tırmanır.', airDate: '2004-06-06', introStart: 0, introEnd: 35, videoFileName: vid(5, 13) },
    ],
  },
  {
    number: 6,
    title: 'Season 6',
    titleTr: 'Sezon 6',
    description: 'Final sezonu — Tony vurulur, Phil Leotardo yükselir ve her şey sona erer.',
    year: '2006-2007',
    episodeCount: 21,
    episodes: [
      { id: epId(6, 1), season: 6, episode: 1, title: 'Members Only', titleTr: 'Sadece Üyelere', description: 'Gene Pontecorvo aileben ayrılmak ister. Junior kritik bir karar verir.', airDate: '2006-03-12', introStart: 0, introEnd: 35, videoFileName: vid(6, 1) },
      { id: epId(6, 2), season: 6, episode: 2, title: 'Join the Club', titleTr: 'Kulübe Katıl', description: 'Tony hayatı ile ölüm arasında kalır.', airDate: '2006-03-19', introStart: 0, introEnd: 35, videoFileName: vid(6, 2) },
      { id: epId(6, 3), season: 6, episode: 3, title: 'Mayham', titleTr: 'Kaos', description: 'Tony hâlâ bilinç ve bilinçsizlik arasında gidip gelir.', airDate: '2006-03-26', introStart: 0, introEnd: 35, videoFileName: vid(6, 3) },
      { id: epId(6, 4), season: 6, episode: 4, title: 'The Fleshy Part of the Thigh', titleTr: 'Uyluğun Etli Kısmı', description: 'Tony hastaneden toparlanmaya başlar.', airDate: '2006-04-02', introStart: 0, introEnd: 35, videoFileName: vid(6, 4) },
      { id: epId(6, 5), season: 6, episode: 5, title: 'Mr. & Mrs. John Sacrimoni Request...', titleTr: 'Bay ve Bayan John Sacrimoni Rica Eder...', description: 'Johnny Sack\'in kızının düğünü.', airDate: '2006-04-09', introStart: 0, introEnd: 35, videoFileName: vid(6, 5) },
      { id: epId(6, 6), season: 6, episode: 6, title: 'Live Free or Die', titleTr: 'Özgür Yaşa ya da Öl', description: 'Vito\'nun sırrı ortaya çıkar.', airDate: '2006-04-16', introStart: 0, introEnd: 35, videoFileName: vid(6, 6) },
      { id: epId(6, 7), season: 6, episode: 7, title: 'Luxury Lounge', titleTr: 'Lüks Salon', description: 'Christopher Hollywood\'a geri döner.', airDate: '2006-04-23', introStart: 0, introEnd: 35, videoFileName: vid(6, 7) },
      { id: epId(6, 8), season: 6, episode: 8, title: 'Johnny Cakes', titleTr: 'Johnny Kekleri', description: 'Vito New Hampshire\'da yeni bir hayat kurmaya çalışır.', airDate: '2006-04-30', introStart: 0, introEnd: 35, videoFileName: vid(6, 8) },
      { id: epId(6, 9), season: 6, episode: 9, title: 'The Ride', titleTr: 'Yolculuk', description: 'Christopher bağımlılıkla mücadelesini sürdürür.', airDate: '2006-05-07', introStart: 0, introEnd: 35, videoFileName: vid(6, 9) },
      { id: epId(6, 10), season: 6, episode: 10, title: "Moe n' Joe", titleTr: "Moe ve Joe", description: 'Vito\'nun kaderi belirlenir.', airDate: '2006-05-14', introStart: 0, introEnd: 35, videoFileName: vid(6, 10) },
      { id: epId(6, 11), season: 6, episode: 11, title: 'Cold Stones', titleTr: 'Soğuk Taşlar', description: 'Carmela Paris\'e gider.', airDate: '2006-05-21', introStart: 0, introEnd: 35, videoFileName: vid(6, 11) },
      { id: epId(6, 12), season: 6, episode: 12, title: 'Kaisha', titleTr: 'Kaisha', description: 'Sezon 6A finali.', airDate: '2006-06-04', introStart: 0, introEnd: 35, videoFileName: vid(6, 12) },
      { id: epId(6, 13), season: 6, episode: 13, title: 'Soprano Home Movies', titleTr: 'Soprano Ev Filmleri', description: 'Tony\'nin doğum günü kutlaması kötü biter.', airDate: '2007-04-08', introStart: 0, introEnd: 35, videoFileName: vid(6, 13) },
      { id: epId(6, 14), season: 6, episode: 14, title: 'Stage 5', titleTr: 'Evre 5', description: 'Johnny Sack\'in sağlığı kötüleşir.', airDate: '2007-04-15', introStart: 0, introEnd: 35, videoFileName: vid(6, 14) },
      { id: epId(6, 15), season: 6, episode: 15, title: 'Remember When', titleTr: 'Hatırla', description: 'Tony ve Paulie bir yolculuğa çıkar.', airDate: '2007-04-22', introStart: 0, introEnd: 35, videoFileName: vid(6, 15) },
      { id: epId(6, 16), season: 6, episode: 16, title: 'Chasing It', titleTr: 'Peşinde Koşmak', description: 'Tony kumar bağımlılığına kapılır.', airDate: '2007-04-29', introStart: 0, introEnd: 35, videoFileName: vid(6, 16) },
      { id: epId(6, 17), season: 6, episode: 17, title: 'Walk Like a Man', titleTr: 'Adam Gibi Yürü', description: 'Christopher ve Paulie\'nin çatışması derinleşir.', airDate: '2007-05-06', introStart: 0, introEnd: 35, videoFileName: vid(6, 17) },
      { id: epId(6, 18), season: 6, episode: 18, title: 'Kennedy and Heidi', titleTr: 'Kennedy ve Heidi', description: 'Dizinin en şok edici anlarından biri. Tony Las Vegas\'a gider.', airDate: '2007-05-13', introStart: 0, introEnd: 35, videoFileName: vid(6, 18) },
      { id: epId(6, 19), season: 6, episode: 19, title: 'The Second Coming', titleTr: 'İkinci Geliş', description: 'A.J. derin bir bunalıma girer.', airDate: '2007-05-20', introStart: 0, introEnd: 35, videoFileName: vid(6, 19) },
      { id: epId(6, 20), season: 6, episode: 20, title: 'The Blue Comet', titleTr: 'Mavi Kuyruklu Yıldız', description: 'Phil Leotardo savaş başlatır.', airDate: '2007-06-03', introStart: 0, introEnd: 35, videoFileName: vid(6, 20) },
      { id: epId(6, 21), season: 6, episode: 21, title: 'Made in America', titleTr: 'Amerika\'da Yapıldı', description: 'Dizi finali. "Don\'t Stop Believin\'" çalarken her şey sona erer.', airDate: '2007-06-10', introStart: 0, introEnd: 35, videoFileName: vid(6, 21) },
    ],
  },
];

// Helper fonksiyonlar
export function getSeasonByNumber(seasonNumber: number): Season | undefined {
  return seasons.find((s) => s.number === seasonNumber);
}

export function getEpisode(seasonNumber: number, episodeNumber: number): Episode | undefined {
  const season = getSeasonByNumber(seasonNumber);
  return season?.episodes.find((e) => e.episode === episodeNumber);
}

export function getNextEpisode(seasonNumber: number, episodeNumber: number): Episode | undefined {
  const season = getSeasonByNumber(seasonNumber);
  if (!season) return undefined;

  const nextEp = season.episodes.find((e) => e.episode === episodeNumber + 1);
  if (nextEp) return nextEp;

  // Sonraki sezona geç
  const nextSeason = getSeasonByNumber(seasonNumber + 1);
  return nextSeason?.episodes[0];
}

export function getPreviousEpisode(seasonNumber: number, episodeNumber: number): Episode | undefined {
  const season = getSeasonByNumber(seasonNumber);
  if (!season) return undefined;

  const prevEp = season.episodes.find((e) => e.episode === episodeNumber - 1);
  if (prevEp) return prevEp;

  // Önceki sezona geç
  const prevSeason = getSeasonByNumber(seasonNumber - 1);
  return prevSeason?.episodes[prevSeason.episodes.length - 1];
}

// Cloudflare R2 CDN base URL (.env'den gelir)
// R2 public access açıkken: https://pub-xxxx.r2.dev
// Custom domain bağlandıktan sonra: https://cdn.sizindomain.com
const R2_BASE = (import.meta.env.VITE_R2_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export function getVideoUrl(episode: Episode): string {
  const ss = String(episode.season).padStart(2, '0');
  const ee = String(episode.episode).padStart(2, '0');
  const seasonFolder = `S${episode.season}`;
  const fileName = `S${ss}E${ee}.mp4`;

  if (R2_BASE) {
    return `${R2_BASE}/${encodeURIComponent(seasonFolder)}/${fileName}`;
  }
  return `/videos/${seasonFolder}/${fileName}`;
}

export function getSubtitleUrl(episode: Episode, lang: 'tr' | 'en' = 'tr'): string {
  const ss = String(episode.season).padStart(2, '0');
  const ee = String(episode.episode).padStart(2, '0');
  const seasonFolder = `S${episode.season}`;
  const fileName = `S${ss}E${ee}${lang === 'en' ? '.en.srt' : '.srt'}`;

  if (R2_BASE) {
    return `${R2_BASE}/${encodeURIComponent(seasonFolder)}/${fileName}`;
  }
  return `/videos/${seasonFolder}/${fileName}`;
}

export const totalEpisodes = seasons.reduce((sum, s) => sum + s.episodeCount, 0);
