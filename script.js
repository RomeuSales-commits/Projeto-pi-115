import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://xxgmufacvbzbxbcxmfcm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z211ZmFjdmJ6YnhiY3htZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDkzMjIsImV4cCI6MjA3Nzc4NTMyMn0.5TtAULeW2b8_eExfWfFfz4YPkzn7J0ki1XlswTj5nNY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =============== FUNÇÕES DE PESSOAS ===============
async function registrarPessoa() {
  const nome = nomeInput.value;
  const telefone = telefoneInput.value;
  const cpf = cpfInput.value;
  const curso = cursoInput.value;

  if (!nome || !telefone || !cpf || !curso) return alert("Preencha todos os campos!");

  await supabase.from("pessoas").insert([{ nome, telefone, cpf, curso }]);
  nomeInput.value = telefoneInput.value = cpfInput.value = cursoInput.value = "";
  carregarDados();
}

async function removerPessoa(nome) {
  if (confirm(`Deseja remover ${nome}?`)) {
    await supabase.from("pessoas").delete().eq("nome", nome);
    carregarDados();
  }
}

// =============== FUNÇÕES DE EQUIPAMENTOS ===============
async function registrarEquipamento() {
  const nome = nomeEquipamento.value;
  const patrimonio = patrimonioInput.value;
  if (!nome || !patrimonio) return alert("Preencha todos os campos!");

  await supabase.from("equipamentos").insert([{ nome, patrimonio, status: "No Armário" }]);
  nomeEquipamento.value = patrimonioInput.value = "";
  carregarDados();
}

async function removerEquipamento(nome) {
  if (confirm(`Deseja remover o equipamento ${nome}?`)) {
    await supabase.from("equipamentos").delete().eq("nome", nome);
    carregarDados();
  }
}

// =============== FUNÇÕES DE EMPRÉSTIMOS ===============
async function registrarEmprestimo() {
  const aluno = alunoEmprestimo.value;
  const equipamento = equipEmprestimo.value;
  if (!aluno || !equipamento) return alert("Selecione aluno e equipamento!");

  const { data: pessoa } = await supabase.from("pessoas").select("*").eq("nome", aluno).single();
  const { data: eqp } = await supabase.from("equipamentos").select("*").eq("nome", equipamento).single();

  if (eqp.status === "Emprestado") return alert("Equipamento já emprestado!");

  await supabase.from("emprestimos").insert([{
    aluno, curso: pessoa.curso, equipamento,
    status: "Emprestado",
    dataEmprestimo: new Date().toLocaleString("pt-BR"),
    dataDevolucao: ""
  }]);

  await supabase.from("equipamentos").update({ status: "Emprestado" }).eq("id", eqp.id);

  carregarDados();
}

async function registrarDevolucao() {
  const sel = devolucaoSelect.value;
  if (!sel) return alert("Selecione um empréstimo!");
  const { data: emp } = await supabase.from("emprestimos").select("*").eq("equipamento", sel.split(" (")[0]).single();
  await supabase.from("emprestimos").update({
    status: "Devolvido",
    dataDevolucao: new Date().toLocaleString("pt-BR")
  }).eq("id", emp.id);

  await supabase.from("equipamentos").update({ status: "No Armário" }).eq("nome", emp.equipamento);

  carregarDados();
}

// =============== CARREGAR DADOS GERAIS ===============
async function carregarDados() {
  const { data: pessoas } = await supabase.from("pessoas").select("*");
  const { data: equipamentos } = await supabase.from("equipamentos").select("*");
  const { data: emprestimos } = await supabase.from("emprestimos").select("*");

  atualizarTabelas(pessoas, equipamentos, emprestimos);
}

function atualizarTabelas(pessoas, equipamentos, emprestimos) {
  const tabelaPessoas = document.getElementById("tabelaPessoas");
  const tabelaEquip = document.getElementById("tabelaEquipamentos");
  const tabelaEmp = document.getElementById("tabelaEmprestimos");

  tabelaPessoas.innerHTML = "<tr><th>Nome</th><th>Telefone</th><th>CPF</th><th>Curso</th><th>Ações</th></tr>";
  pessoas.forEach(p => {
    tabelaPessoas.innerHTML += `
      <tr><td>${p.nome}</td><td>${p.telefone}</td><td>${p.cpf}</td><td>${p.curso}</td>
      <td><button onclick="removerPessoa('${p.nome}')">🗑️</button></td></tr>`;
  });

  tabelaEquip.innerHTML = "<tr><th>Nome</th><th>Patrimônio</th><th>Status</th><th>Ações</th></tr>";
  equipamentos.forEach(e => {
    tabelaEquip.innerHTML += `
      <tr><td>${e.nome}</td><td>${e.patrimonio}</td><td>${e.status}</td>
      <td><button onclick="removerEquipamento('${e.nome}')">🗑️</button></td></tr>`;
  });

  tabelaEmp.innerHTML = "<tr><th>Equipamento</th><th>Aluno</th><th>Curso</th><th>Status</th><th>Data Empréstimo</th><th>Data Devolução</th></tr>";
  emprestimos.forEach(emp => {
    tabelaEmp.innerHTML += `
      <tr><td>${emp.equipamento}</td><td>${emp.aluno}</td><td>${emp.curso}</td><td>${emp.status}</td>
      <td>${emp.dataEmprestimo}</td><td>${emp.dataDevolucao || "---"}</td></tr>`;
  });
}

function mostrarAba(nome) {
  document.querySelectorAll(".tab, .tab-content").forEach(e => e.classList.remove("active"));
  document.querySelector(`.tab[onclick*='${nome}']`).classList.add("active");
  document.getElementById(nome).classList.add("active");
}

carregarDados();
