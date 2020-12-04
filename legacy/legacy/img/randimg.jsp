<%@ page import="java.util.Hashtable,java.awt.Font,java.awt.Graphics,
                java.awt.image.BufferedImage,
		java.util.Random,java.awt.Color,
                javax.imageio.ImageIO
                " %><%
/*
* randomly generate a string and draw it in browser with disturbing spots and lines
* created by wadelau, last updated on 2005.12.28
*/ 
String sessionid=request.getParameter("sid");
if(sessionid==null){ sessionid=""; }
com.ufqi.base.UserInfo userinfo = new com.ufqi.base.UserInfo();
if(!userinfo.getSession(sessionid)){
	System.out.println("randimg.jhtml: get old session fail. sid:["+sessionid+"]");
	return ;
}

Random rd = new Random();
//int randlen = 5; //rand string length, how many char would be displayed to user
int randlen = 4; //rand string length, how many char would be displayed to user
int fontsize = 16 ; //font size
int beforefirstposx = rd.nextInt(5)+2 ; // space before first char
int beforefirstposy = rd.nextInt(5)+3 ; // space up first char
int markspot = 35; // number of spots
int linenum = 3 ; // number of lines

out.clear();
response.setContentType("image/jpeg");
response.addHeader("pragma","NO-cache");
response.addHeader("Cache-Control","no-cache");
response.addDateHeader("Expries",0);
// create the raw img in memory
int width = randlen * fontsize + beforefirstposx ;
int height= fontsize + beforefirstposy * 2 ; 
BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB); 

// initiate the graphic , here need support from JVM started with para "-D java.awt.headless=true" 
Graphics g = image.getGraphics(); 

// set bgcolor of the img
g.setColor(new Color(0xFFFFFF));
g.fillRect(0, 0, width, height); 

// draw outline of the img
g.setColor(Color.gray); 
g.drawRect(0,0,width-1,height-1); 

// randomly generate chars needed
//String basestr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
String basestr = "3456789ADEFHKMNPRSTUVWXY"; //--- remove unrecognizeable chars
char[] chrarr = basestr.toCharArray();
// set a fonts collection
Hashtable fontht = new Hashtable ();
fontht.put("1","Atlantic Inline");
fontht.put("2","Verdana");
fontht.put("3","Tahoma");
fontht.put("4","Courier New");
fontht.put("5","Arial Black");
fontht.put("6","SimSun");
fontht.put("7","Times New Roman");
String rand ="" ;
StringBuffer tmpbf = new StringBuffer("");
// get random char and draw it on the img
int baselen = basestr.length();
for(int randi=0;randi<randlen;randi++){
	//int tmprandnum = rd.nextInt(35);
	int tmprandnum = rd.nextInt(baselen);
	tmpbf.append(""+chrarr[tmprandnum]);
	int fontnum = rd.nextInt(7);
	g.setColor(new Color(rd.nextInt(255),rd.nextInt(255),rd.nextInt(255)));
	String tmpfont = (String)fontht.get(""+fontnum) ;
	if(tmpfont==null){tmpfont="Arial Black";}
	g.setFont(new Font(tmpfont,Font.BOLD,fontsize));
	String tmpstr = String.valueOf(chrarr[tmprandnum]);
	int tmpposx = randi * fontsize + beforefirstposx;
	int tmpposy = fontsize;
	int tmpdivide = rd.nextInt(3);
        if(tmpdivide==0){tmpdivide=1;}
	if(randi%tmpdivide==0)
        {
                tmpposy = fontsize + beforefirstposy;
        }
        g.drawString(tmpstr,tmpposx,tmpposy);
	// mark random line
	if(randi>= (randlen - linenum) )
	{
		g.drawLine(rd.nextInt(width),rd.nextInt(height),rd.nextInt(tmpposx),rd.nextInt(tmpposy));
	}
}
rand = tmpbf.toString() ;
tmpbf = null ;
fontht = null;
// save randstr in session
//session.setAttribute("randnum",rand); 
userinfo.setRandCode(rand);
userinfo.setSession(sessionid);

// randomly generate markspots  
for (int i=0;i<markspot;i++) 
{ 
	int x = rd.nextInt(width); 
	int y = rd.nextInt(height); 
	g.drawOval(x,y,0,0); 
} 

// dispose the graphic
g.dispose(); 
rd = null;

// output the img to browser
ServletOutputStream sos = response.getOutputStream();
//JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(sos);
//encoder.encode(image);
//ImageIO.write(image, "jpeg", new File(image));
ImageIO.write(image, "jpeg", sos);
sos.close();

image = null ;

userinfo=null ;

%>

