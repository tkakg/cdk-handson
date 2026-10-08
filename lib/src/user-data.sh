#!/bin/bash
dnf -y update
dnf -y install php php-mysqlnd php-mbstring php-xml httpd mariadb105
wget http://ja.wordpress.org/latest-ja.tar.gz -P /tmp/
tar zxvf /tmp/latest-ja.tar.gz -C /tmp
cp -r /tmp/wordpress/* /var/www/html/
chown apache:apache -R /var/www/html
systemctl enable httpd.service
systemctl start httpd.service