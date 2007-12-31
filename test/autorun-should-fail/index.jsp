<!-- Copyright 2007 by Oliver Steele.  Available under the MIT License. -->
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title></title>
    <script src="../../lib/jquery-1.2.1.min.js" type="text/javascript"></script>
    <script src="../../lib/swfobject.js" type="text/javascript"></script>
    <script src="../../src/autorun-browser.js" type="text/javascript"></script>
    <link href="../../src/autorun.css" type="text/css" rel="stylesheet" />
  </head>
  <body>
    <script type="text/javascript">
      var files = <%@ include file="../../src/list-files.jsp" %>;
      LzTestRunner.run({
        files: files,
        match: /(test-.*)\.lzx/
      });
    </script>
  </body>
</html>
