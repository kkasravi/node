process.mixin(require("./common"));
tcp = require("tcp");
posix=require("posix");

var tests_run = 0;

function tlsTest (port, host, caPem, keyPem, certPem) {
  var N = 50;
  var count = 0;
  var sent_final_ping = false;

  var server = tcp.createServer(function (socket) {
    assertTrue(socket.remoteAddress !== null);
    assertTrue(socket.remoteAddress !== undefined);
    if (host === "127.0.0.1")
      assertEquals(socket.remoteAddress, "127.0.0.1");
    else if (host == null)
      assertEquals(socket.remoteAddress, "127.0.0.1");

    socket.setEncoding("utf8");
    socket.setNoDelay();
    socket.timeout = 0;

    socket.addListener("receive", function (data) {
      var verified = socket.verifyPeer();
      var peerDN = socket.getPeerCertificate("DNstring");
      assertEquals(verified, 1);
      assertEquals(peerDN, "C=UK,ST=Acknack Ltd,L=Rhys Jones,O=node.js,"
                           + "OU=Test TLS Certificate,CN=localhost");
      puts("server got: " + JSON.stringify(data));
      assertEquals("open", socket.readyState);
      assertTrue(count <= N);
      if (/PING/.exec(data)) {
        socket.send("PONG");
      }
    });

    socket.addListener("eof", function () {
      assertEquals("writeOnly", socket.readyState);
      socket.close();
    });

    socket.addListener("close", function (had_error) {
      assertFalse(had_error);
      assertEquals("closed", socket.readyState);
      socket.server.close();
    });
  });

  server.setSecure('X509_PEM', caPem, 0, keyPem, certPem);
  server.listen(port, host);

  var client = tcp.createConnection(port, host);

  client.setEncoding("utf8");
  client.setSecure('X509_PEM', caPem, 0, keyPem, caPem);

  client.addListener("connect", function () {
    assertEquals("open", client.readyState);
    var verified = client.verifyPeer();
    var peerDN = client.getPeerCertificate("DNstring");
    assertEquals(verified, 1);
    assertEquals(peerDN, "C=UK,ST=Acknack Ltd,L=Rhys Jones,O=node.js,"
			 + "OU=Test TLS Certificate,CN=localhost");
    client.send("PING");
  });

  client.addListener("receive", function (data) {
    assertEquals("PONG", data);
    count += 1;

    puts("client got PONG");

    if (sent_final_ping) {
      assertEquals("readOnly", client.readyState);
      return;
    } else {
      assertEquals("open", client.readyState);
    }

    if (count < N) {
      client.send("PING");
    } else {
      sent_final_ping = true;
      client.send("PING");
      client.close();
    }
  });

  client.addListener("close", function () {
    assertEquals(N+1, count);
    assertTrue(sent_final_ping);
    tests_run += 1;
  });
}


var have_tls;
try {
  var dummy_server = tcp.createServer();
  dummy_server.setSecure();
  have_tls=true;
} catch (e) {
  have_tls=false;
} 

if (have_tls) {
  var caPem = posix.cat(fixturesDir+"/test_ca.pem").wait();
  var certPem = posix.cat(fixturesDir+"/test_cert.pem").wait();
  var keyPem = posix.cat(fixturesDir+"/test_key.pem").wait();

  /* All are run at once, so run on different ports */
  tlsTest(20443, "localhost", caPem, keyPem, certPem);
  tlsTest(21443, null, caPem, keyPem, certPem);

  process.addListener("exit", function () {
    assertEquals(2, tests_run);
  });
} else {
  puts("Not compiled with TLS support.");
  process.exit(1);
}
