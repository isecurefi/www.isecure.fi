/* global AWS */

AWS.config.region = "eu-west-1";
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "eu-west-1:350ec7b8-c08e-4bc6-a52f-fad9f2b1ae5c",
});

function SendSNS(msg, name, email, result, thankyou) {
  const trimmedMsg = msg.trim();
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedThankyou = thankyou.trim();

  if (trimmedMsg === "" || trimmedName === "" || trimmedEmail === "") {
    if (result) {
      result.innerHTML = "<b>Anna nimi, s&auml;hk&ouml;posti ja viesti.</b>";
    }
    return;
  }

  var sns = new AWS.SNS({
    params: {
      TopicArn: "arn:aws:sns:eu-west-1:589434896614:ISECureWebsiteSnsToEmail",
    },
  });
  if (result)
    result.innerHTML = "<b>L&auml;hetet&auml;&auml;n viesti&auml;..</b>\n";
  sns.publish(
    {
      Message: `From: ${trimmedName} <${trimmedEmail}>\nMessage:\n${trimmedMsg}`,
      Subject: `ISECure WS-Kanava contact: ${trimmedName} <${trimmedEmail}>`,
    },
    function (err, data) {
      if (!err) {
        if (result) result.innerHTML = "<b>Viesti l&auml;hetetty!</b>";
        console.log(data);
        var callback = function () {
          window.location = thankyou;
        };
        gtag("event", "conversion", {
          send_to: "AW-1025469048/9KrvCJHsiY0BEPjU_egD",
          value: 5.0,
          currency: "EUR",
          event_callback: callback,
        });
      } else {
        console.log(err, err.stack);
        if (result)
          result.innerHTML =
            "<b>Viesti&auml; ei voitu l&auml;hett&auml;&auml;!</b>";
      }
    },
  );
}
