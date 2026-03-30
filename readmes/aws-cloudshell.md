## 🟢 What is AWS CloudShell?

**AWS CloudShell** is a **browser-based Linux terminal** that gives you a pre-authenticated command-line environment in the AWS Console. It allows you to run **AWS CLI, scripts, and development tools** directly in your browser — with **no local setup required**.
  d
---

### 🖥️ ✅ It’s a Real Linux System

When you launch CloudShell, you are given access to a **Linux virtual machine** running in your chosen AWS region.

### ✅ Linux Environment Details:

| Feature             | Value                                                     |
| ------------------- | --------------------------------------------------------- |
| **OS**              | Amazon Linux 2 (a CentOS/RHEL-like distro)                |
| **CPU**             | 2 vCPUs (shared)                                          |
| **RAM**             | \~4 GB                                                    |
| **Disk Space**      | 1 GB of **persistent storage** at `/home/cloudshell-user` |
| **Session timeout** | Inactive sessions are stopped after \~20–30 minutes       |
| **Session limit**   | Max 20 concurrent sessions (soft quota)                   |

---

## 🔧 How to Check System Configuration

Once inside CloudShell, run these commands:

### ✅ OS and Kernel

```bash
uname -a
cat /etc/os-release
```

### ✅ CPU Info

```bash
lscpu
```

### ✅ Memory Info

```bash
free -h
```

### ✅ Disk Space

```bash
df -h
```

### ✅ Installed Tools

```bash
aws --version
node -v
npm -v
python3 --version
git --version
```

> You’ll find tools like:
>
> * `aws cli`
> * `git`, `zip`, `unzip`
> * `python3`, `node`, `npm`
> * `docker` (limited)
> * `bash`, `tmux`, `vim`, `nano`, etc.

---

## 📦 Persistent File Storage

* The directory `/home/cloudshell-user` is **persisted across sessions**.
* Max size: **1 GB**
* Use it to save scripts, config files, or credentials.

---


## 🧑‍💻🔐 How AWS CloudShell Is Tied to Each User

* **CloudShell is user-specific and region-specific**.
* It is automatically provisioned for each **IAM user** or **federated identity (SSO/STS)**.
* The environment is **pre-authenticated with that user's credentials**, so anything you do (e.g., `aws s3 ls`) is performed as **you**.

### ✅ So:

* Your CloudShell environment belongs to **you only**.
* You **cannot access another user's CloudShell** or files.
* Each AWS **region** has a **separate CloudShell environment**, including its own 1 GB of storage.

---

## 💾 What About Storage?

### ✅ Persistent Storage: `/home/cloudshell-user`

* You get **1 GB of persistent storage** per region.
* This storage is **persisted across sessions and reboots**.
* Your files, scripts, and CLI history remain intact as long as:

  * Your **AWS account is active**
  * Your **IAM user (or federated identity) is not deleted**

> 🔐 It acts like a small Linux home directory tied to your IAM identity in that region.

---

## 🔁 When Is It Deleted?

Your CloudShell storage is **retained indefinitely**, **unless**:

1. You or your admin **delete your IAM user or role**.
2. You **manually delete files** using `rm` or similar.
3. You explicitly choose to **delete CloudShell storage** via the AWS Console.

There is **no auto-deletion** of CloudShell storage as long as your user exists.

---

## ✅ When to Use CloudShell

* You don’t want to set up AWS CLI on your local machine
* You need to **quickly test something** in your account
* You want to run shell scripts or deploy infrastructure from a browser
* You're using a **shared/public device** but still need secure access
