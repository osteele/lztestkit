[
  <%
    // Copyright 2007 by Oliver Steele.  Available under the MIT License.
     java.io.File path = new java.io.File(getServletConfig().getServletContext().getRealPath(request.getServletPath())).getParentFile();
     for (java.util.Iterator e = java.util.Arrays.asList(path.list()).iterator(); e.hasNext(); ) { %>
  "<%= e.next() %>"
  <%= e.hasNext() ? ", " : "" %>
  <% } %>
]
