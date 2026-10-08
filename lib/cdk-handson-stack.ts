import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

//ファイルを読み込むライブラリのインポート
import { readFileSync } from 'fs';

export class CdkHandsonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //VPCの作成
    const vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/20'),
      maxAzs: 2,
      natGateways: 0,
    });

    //ECの作成
    const webserver01 = new ec2.Instance(this, 'webserver01', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      vpc: vpc,
      vpcSubnets: {
        availabilityZones: [vpc.availabilityZones[0]],
        subnetType: ec2.SubnetType.PUBLIC
      }
    });

    //User Dataの作成
    const script = readFileSync("./lib/src/user-data.sh", "utf-8")
    webserver01.addUserData(script)

    //セキュリティグループの作成
    webserver01.connections.allowFromAnyIpv4(ec2.Port.tcp(80))

    //RDSの作成
    const dbserver = new rds.DatabaseInstance(this, 'dbserver', {
     engine: rds.DatabaseInstanceEngine.mysql({version: rds.MysqlEngineVersion.VER_8_4_5}),
     vpc: vpc,
     vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE_ISOLATED},
     availabilityZone: vpc.availabilityZones[0],
     instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
     allocatedStorage: 20,
     databaseName: 'handsonwordpress',
   });

   // セキュリティグループを設定
   dbserver.connections.allowFrom(webserver01, ec2.Port.tcp(3306))
  }
}