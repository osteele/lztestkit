<!-- Copyright 2007 by Oliver Steele.  Available under the MIT License. -->
<script type="text/javascript">
  var files = [
  <%
     java.io.File path = new java.io.File(getServletConfig().getServletContext().getRealPath(request.getServletPath())).getParentFile();
     boolean firstTime = true;
     for (java.util.Iterator e = java.util.Arrays.asList(path.list()).iterator(); e.hasNext(); ) { %>
  <%= firstTime ? "" : ", " %>
  <% firstTime = false; %>
  "<%= e.next() %>"
  <% } %>
  ]
</script>
