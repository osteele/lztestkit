<!-- Copyright 2007 by Oliver Steele.  Available under the MIT License. -->
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title></title>
    <script src="../../lib/jquery-1.2.1.min.js" type="text/javascript"></script>
    <script src="../../lib/swfobject.js" type="text/javascript"></script>
    <script src="../../src/autorun-browser.js" type="text/javascript"></script>
    <style type="text/css">
      body.running {margin:0}
      body.success {background: green}
      body.failed {margin:10px; background:red}
      .status {font-size:24pt; text-align: center; padding-top:40px}
      #file-list li {list-style-type:none; line-height:170%}
      #file-list a {font-size:18pt; color:#4c4; text-decoration:none}
      #file-list a:hover {text-decoration:underline}
    </style>
  </head>
  <body>
    <script type="text/javascript">
      var files = <%@ include file="../../src/list-files.jsp" %>;
      LzTestRunner.run({
        files: files,
        match: /(test-.*)\.lzx/,
        exclude: ['test-exclusion.lzx']
      });
    </script>
  </body>
</html>
