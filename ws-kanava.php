<?php include('lang.php'); ?>
<!DOCTYPE html>
<html lang="fi">
  <head>
    <?php include('header.php'); ?>
    <!-- Event snippet for WS SDK conversion page -->
    <script>
      gtag('event', 'conversion', {
          'send_to': 'AW-1025469048/6B-QCM6LvFcQ-NT96AM',
          'value': 1.0,
          'currency': 'EUR'
      });
    </script>
    <title>ISECure Oy - WS Kanava</title>
    <meta name="description" content="ISECure Oy - Information about WS Kanava software packages">
    <link rel="canonical" href="https://www.isecure.fi/ws-kanava.html" hreflang="fi">
  </head>
  <body>
    <?php include('navigation.php'); ?>
    <?php include('carousel.php'); carousel(1); ?>
    <?php include('supportedbanks-fluid.php'); ?>

    <!-- Page Content -->
    <div class="container">

        <!-- Page Heading/Breadcrumbs -->
        <div class="row">
            <div class="col-lg-12">
                <h1 class="page-header">ISECure WS-Kanava</h1>
            </div>
        </div>
        <!-- /.row -->

        <!-- Features Section -->
        <div class="row">
            <div class="col-md-8">
	      <p>WS-KANAVA SUORAAN PILVIPALVELUNA YRITYKSILLE</p>
 
	      <p>Tarjoamme testatun ja verifioidun koodin täydellä
	      lisenssillä kehitys- ja asiakastarpeisiinne.</p>
 
	      <p class="blue-text"><i>"ISECuren WS-kanavalla voi esimerkiksi ladata
	      automaattisesti konekieliset tiliotteet ja viitesiirrot
	      ja yhdistää ne korkealaatuisen JavaScript-kirjaston
	      kanssa interaktiivisten statistiikkojen
	      luomiseksi."</i></p>
 
	      <p>ISECuren WS-Kanava sisältää
	      WebService-pankkiyhteysohjelmisto SDK:n usealle
	      pankille: Nordea, DanskeBank, Osuuspankki,
	      S-Pankki/LähiTapiola, Ålandsbanken, Samlink -pankit:
	      Handelsbanken, Aktia, POP, Säästöpankki. Tuemme sekä
	      APP- että PKI-puolta (mm. sertifikaatin haku PIN
	      -koodilla ja uusinta). WS-kanava on ollut tuotannossa
	      yli 10 vuotta ja on käytössä useilla asiakkailla.</p>
            </div>
            <div class="col-md-4">
	      <p class="blue-text">Voit ostaa
	      WS-kanavan suoraan palveluna Hosting -paketilla (SaaS)
	      valitsemillesi tai kaikille pankeille.</p>
	      
              <a href="#contact" class="btn btn-primary">Kysy Lis&auml;&auml;</a>
            </div>
        </div>
        <!-- /.row -->

	<h3>Tuetut pankit</h3>
	<?php include('banks.php'); ?>
	<br>

        <!-- Service Panels -->
        <!-- The circle icons use Font Awesome's stacked icon classes. For more information, visit http://fontawesome.io/examples/ -->
        <div class="row">
            <div class="col-lg-12">
                <h2 class="page-header"></h2>
            </div>
            <!-- <div class="col-md-4 col-md-7">
                <div class="panel panel-default text-center">
                    <div class="panel-heading">
                        <h4>SELECTED CODE</h4>
                        <p>VALITTUJEN PANKKIEN<br> WS-KANAVIEN KOODI</p><img src="images/phplogo.png" style="width:65px;">&nbsp;<img src="images/linux.png" style="">
                    </div>
                    <div class="panel-body">
			<ul>
			  <li>Valitsemasi tuetut pankit
			  <li>PHP5 (osin C) lähdekoodi, jonka pohjalta rakennat palvelun tai integraation
			  <li>Luokkapohjainen tai suora funktiokutsu -rajapinta
			  <li>Luokkapohjainen rajapinta lisäksi suojaa jokaisen pankkikoodin omaan prosessiin, jonka PHP rajapintaa voidaan edelleen rajoittaa ja tiukentaa (php-sandbox)
			  <li>Lähdekoodia ei saa jälleemyydä, eikä laittaa avoimeen jakeluun
			</ul>
                        <a href="#contact" class="btn btn-primary">Kysy Lis&auml;&auml;</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 col-md-7">
                <div class="panel panel-default text-center">
                    <div class="panel-heading">
                        <h4>DEVELOPER ACCESS</h4>
			<p>KAIKKIEN&nbsp;PANKKIEN WS-KANAVAT<br>+ GITHUB + TUKIPALVELU</p><img src="images/github.png" style="width:40px;">&nbsp;
                    </div>
                    <div class="panel-body">
 			<ul>
			  <li>"SELECTED CODE": kaikki tuetut pankit
			  <li>Pääsy koodin versionhallintaan (GitHub collaborator)
			  <li>Mahdollisuus osallistua kehitykseen, vaikuttaa ominaisuuksiin ja integrointeihin - koodisi pysyy ajan tasalla
			  <li>Automaattiset testit laadunvalvontaan (CI)
			  <li>Tietoturva- ja korjauspäivitykset
			  <li>Pankkien palvelusertifikaattien päivitykset
			  <li>Pankkien rajapintapäivitykset
			  <li>Tukipalvelu GitHubin tikettijärjestelmän kautta
			  <li>HUOM: Kysy myös erillisenä palveluna valmis ja ajantasainen pankki-integrointiympäristö
			</ul>
                        <a href="#contact" class="btn btn-primary">Kysy Lis&auml;&auml;</a>
                    </div>
                </div>
            </div> -->
            <div class="col-md-8">
                <div class="panel panel-default text-center">
                    <div class="panel-heading">
                        <h4>SAAS</h4>
                        <p>WS-KANAVAT<br> PILVIPALVELUNA</p><img src="images/awslogo.png">
                    </div>
                    <div class="panel-body">
			<ul>
			  <li>Globaalisti skaalautuva turvallinen WS-kanava valitsemillesi pankeille (AWS API Gateway, Lambda, KMS, Cognito, DynamoDB, jne.)
			  <li>Amazon AWS KMS avaintenhallintaan perustuva sertifikaattien salaisen avaimen suojaus
			  <li>Swagger REST API kuvaus (JSON data) ja valmis testiympäristö integraatiota varten, integraatio yhdessä päivässä
              <li>Automaattinen sertifikaattien uusinta
			  <li>Automaattiset tietoturva- ja korjauspäivitykset (huom palveliton ympäristö AWS Lambdalla)
              <li>Kaksitasoinen käyttäjätunnus (luku ja luku+kirjoitus SMS MFA:lla), mahdollisuus myös GPG allekirjoituksille (n allekirjoitusta m:stä maksujen hyväksyntää varten)
			</ul>
                        <a href="#contact" class="btn btn-primary">Kysy Lis&auml;&auml;</a>
                    </div>
                </div>
            </div>
        </div>


        <!-- Service Tabs -->
	<!--
        <div class="row">
            <div class="col-lg-12">
            </div>
            <div class="col-lg-12">

                <ul id="myTab" class="nav nav-tabs nav-justified">
                    <li class="active"><a href="#service-one" data-toggle="tab"></i>SELECTED CODE</a>
                    </li>
                    <li class=""><a href="#service-two" data-toggle="tab"></i>DEVELOPER ACCESS</a>
                    </li>
                    <li class=""><a href="#service-three" data-toggle="tab"></i>+HOSTING</a>
                    </li>
                </ul>

                <div id="myTabContent" class="tab-content">
                    <div class="tab-pane fade active in" id="service-one">
                        <h4>SELECTED CODE</h4>
                    </div>
                    <div class="tab-pane fade" id="service-two">
                        <h4>DEVELOPER ACCESS</h4>
                    </div>
                    <div class="tab-pane fade" id="service-three">
                        <h4>SAAS</h4>
                    </div>
                </div>

            </div>
        </div>
        -->
    </div>
    <!-- /.container -->

    <?php include('contact.php'); ?>
    <hr>
    <?php include('references.php'); ?>
    <?php include('ws-info.php'); ?>
    <?php include('footer.php'); ?>
    <?php include('end.php'); static_page(); ?>
  </body>
</html>
