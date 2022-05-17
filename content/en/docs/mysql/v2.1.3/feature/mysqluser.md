---
shortTitle: "User CRD"
title: "Manage MySQL Users"
weight: 3
---
> RadonDB MySQL Kubernetes 2.1.0+

# Prerequisites

- RadonDB MySQL Cluster

# Create User Account

## Setp 1: Check CRD

Use the following command to view the CRD named `mysqlusers.mysql.radondb.com`.

```shell
$ kubectl get crd | grep mysqluser
mysqlusers.mysql.radondb.com                          2021-09-21T09:15:08Z
```

## Step 2: Create Secret

Radondb MySQL uses the [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) object in k8s to save the user's password.

Use the following instructions to create a Secret named `sample-user-password` using the sample configuration.

```shell
$ kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/main/config/samples/mysqluser_secret.yaml
```

## Step 3: Create User

Use the following instructions to create a user named `sample_user` using the sample configuration.

```shell
$ kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/main/config/samples/mysql_v1alpha1_mysqluser.yaml 
```

> Note: directly modifying spec.user (user name) is equivalent to creating a user with a new user name. To create multiple users, make sure that metadata.name (CR instance name) corresponds to spec.user (user name) one by one.

# Modify User Account

The user account information is defined by the parameters in the spec field. Currently, it supports:
* Modify the `hosts` parameter.
* Add the `permissions` parameter.

## Authorized IP
The IP of the user account is allowed to be used, which is defined by the `hosts` field parameter.
* % means all IP addresses are accessible.
* One or more IPs can be modified.

```shell
  hosts: 
    - "%"
```

## User Rights
User account database access rights are defined through the permissions field parameter in mysqlUser. You can add the user account permission by adding the parameter value of permissions field.

```plain
permissions:
    - database: "*"
      tables:
        - "*"
      privileges:
        - SELECT
```
* The `database` parameter indicates the database that the user account is allowed to access. 
* Delegates are allowed to access all databases in the cluster.
* The `tables` parameter indicates the database tables that the user account is allowed to access. 
* Delegate allows access to all tables in the database.
* The `privileges` parameter indicates the authorized database permissions of the user account. For more permission descriptions, see[Privileges Supported by MySQL](https://dev.mysql.com/doc/refman/5.7/en/grant.html)。

# Delete User Account
The mysqluser CR created with sample configuration will be deleted using the following instructions.

```shell
$ kubectl delete mysqluser sample-user-cr
```

> Note: deleting mysqluser CR will automatically delete the MySQL user corresponding to cr.

# Sample configuration

## Secret

```shell
apiVersion: v1
kind: Secret
metadata:
  name: sample-user-password   # password name. Applied to the secretselector. In mysqluser secretName。  
data:
  pwdForSample: UmFkb25EQkAxMjMKIA==  # pws, applied to the secretselector in mysqluser secretKey。 The example password is Base64 encrypted RadonDB@123
  # pwdForSample2:
  # pwdForSample3:
```

## MysqlUser

```plain
apiVersion: mysql.radondb.com/v1alpha1
kind: MysqlUser
metadata:
 
  name: sample-user-cr  # User CR name. It is recommended to use one user CR to manage one user.
spec:
  user: sample_user  # The name of the user who needs to be created / updated.
  hosts:             # Multiple hosts that support access can be filled in, % represents all hosts.
       - "%"
  permissions:
    - database: "*"  # Database name, * for all databases
      tables:        # Table name, * for all tables
         - "*"
      privileges:    # Permissions, reference https://dev.mysql.com/doc/refman/5.7/en/grant.html。
         - SELECT
  
  userOwner:  # Specify the cluster where the operated user is located. Modification is not supported.
    clusterName: sample
    nameSpace: default # The namespace of the RadonDB MySQL Cluster. 
  
  secretSelector:  # Specify the user's key and the key to save the current user's password.
    secretName: sample-user-password  #password name. 
    secretKey: pwdForSample  # Key: a key can save the passwords of multiple users, which can be distinguished by key.
```