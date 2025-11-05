// Importa o cliente Supabase
import { supabase } from './supabaseClient.js'

// ============================
// Funções de abas (navegação)
// ============================
function mostrarAba(abaId) {
  document.querySelectorAll(".tab-content").forEach(div => div.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.getElementById(abaId).classList.add("active");
  document.querySelector(`.tab[onclick="mostrarAba('${abaId}')"]`).classList.add("active");
}

// ============================
// PESSOAS
// ============================
async function registrarPessoa() {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const curso = document.getElementById("curso").value.trim();

  if (!nome || !telefone || !cpf || !curso) {
    alert("Preencha todos os campos!");
    return;
  }

  const { error } = await supabase.from("pessoas").insert([{ nome, telefone, cpf, curso }]);
  if (error) {
    alert("Erro ao registrar pessoa: " + error.message);
  } else {
    alert("Pessoa registrada com sucesso!");
    carregarPessoas();
  }
}

async function carregarPessoas() {
  const { data, error } = await supabase.from("pessoas").select("*");
  const tabela = document.getElementById("tabelaPessoas");
  tabela.innerHTML = "<tr><th>Nome</th><th>Telefone</th><th>CPF</th><th>Curso</th><th>Ações</th></tr>";

  data?.forEach(p => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.telefone}</td>
      <td>${p.cpf}</td>
      <td>${p.curso}</td>
      <td><button onclick="removerPessoa('${p.cpf}')">Remover</button></td>
    `;
    tabela.appendChild(linha);
  });

  atualizarSelects();
}

async function removerPessoa(cpf) {
  const confirmar = confirm("Deseja realmente remover esta pessoa?");
  if (!confirmar) return;

  const { error } = await supabase.from("pessoas").delete().eq("cpf", cpf);
  if (error) alert("Erro ao remover: " + error.message);
  else carregarPessoas();
}

// ============================
// EQUIPAMENTOS
// ============================
async function registrarEquipamento() {
  const nome = document.getElementById("nomeEquipamento").value.trim();
  const patrimonio = document.getElementById("patrimonio").value.trim();

  if (!nome || !patrimonio) {
    alert("Preencha todos os campos!");
    return;
  }

  const { error } = await supabase.from("equipamentos").insert([{ nome, patrimonio, status: "No Armário" }]);
  if (error) alert("Erro ao registrar equipamento: " + error.message);
  else {
    alert("Equipamento registrado com sucesso!");
    carregarEquipamentos();
  }
}

async function carregarEquipamentos() {
  const { data, error } = await supabase.from("equipamentos").select("*");
  const tabela = document.getElementById("tabelaEquipamentos");
  tabela.innerHTML = "<tr><th>Nome</th><th>Patrimônio</th><th>Status</th><th>Ações</th></tr>";

  data?.forEach(eq => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${eq.nome}</td>
      <td>${eq.patrimonio}</td>
      <td>${eq.status}</td>
      <td><button onclick="removerEquipamento('${eq.patrimonio}')">Remover</button></td>
    `;
    tabela.appendChild(linha);
  });

  atualizarSelects();
}

async function removerEquipamento(patrimonio) {
  const confirmar = confirm("Deseja realmente remover este equipamento?");
  if (!confirmar) return;

  const { error } = await supabase.from("equipamentos").delete().eq("patrimonio", patrimonio);
  if (error) alert("Erro ao remover: " + error.message);
  else carregarEquipamentos();
}

// ============================
// EMPRÉSTIMOS
// ============================
async function registrarEmprestimo() {
  const aluno = document.getElementById("alunoEmprestimo").value;
  const equip = document.getElementById("equipEmprestimo").value;

  if (!aluno || !equip) {
    alert("Selecione um aluno e um equipamento!");
    return;
  }

  const curso = aluno.split(" - ")[1];
  const data_emprestimo = new Date().toLocaleString("pt-BR");
  const status = "Emprestado";

  await supabase.from("emprestimos").insert([{ aluno, curso, equipamento: equip, data_emprestimo, status }]);
  await supabase.from("equipamentos").update({ status }).eq("nome", equip);

  alert("Empréstimo registrado com sucesso!");
  carregarEmprestimos();
  carregarEquipamentos();
}

async function registrarDevolucao() {
  const devolucaoSelect = document.getElementById("devolucaoSelect");
  const emprestimoId = devolucaoSelect.value;

  if (!emprestimoId) {
    alert("Selecione um empréstimo para devolver!");
    return;
  }

  const data_devolucao = new Date().toLocaleString("pt-BR");

  await supabase.from("emprestimos").update({ status: "Devolvido", data_devolucao }).eq("id", emprestimoId);

  // Atualizar status do equipamento
  const { data } = await supabase.from("emprestimos").select("equipamento").eq("id", emprestimoId).single();
  if (data?.equipamento) {
    await supabase.from("equipamentos").update({ status: "No Armário" }).eq("nome", data.equipamento);
  }

  alert("Equipamento devolvido com sucesso!");
  carregarEmprestimos();
  carregarEquipamentos();
}

async function carregarEmprestimos() {
  const { data, error } = await supabase.from("emprestimos").select("*");
  const tabela = document.getElementById("tabelaEmprestimos");
  tabela.innerHTML = "<tr><th>Equipamento</th><th>Aluno</th><th>Curso</th><th>Status</th><th>Data Empréstimo</th><th>Data Devolução</th></tr>";

  const devolucaoSelect = document.getElementById("devolucaoSelect");
  devolucaoSelect.innerHTML = "";

  data?.forEach(e => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${e.equipamento}</td>
      <td>${e.aluno}</td>
      <td>${e.curso}</td>
      <td>${e.status}</td>
      <td>${e.data_emprestimo}</td>
      <td>${e.data_devolucao || "-"}</td>
    `;
    tabela.appendChild(linha);

    if (e.status === "Emprestado") {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = `${e.equipamento} - ${e.aluno}`;
      devolucaoSelect.appendChild(opt);
    }
  });
}

// ============================
// ATUALIZAR SELETORES
// ============================
async function atualizarSelects() {
  const { data: pessoas } = await supabase.from("pessoas").select("*");
  const { data: equipamentos } = await supabase.from("equipamentos").select("*");

  const alunoSelect = document.getElementById("alunoEmprestimo");
  const equipSelect = document.getElementById("equipEmprestimo");

  alunoSelect.innerHTML = "";
  equipSelect.innerHTML = "";

  pessoas?.forEach(p => {
    const opt = document.createElement("option");
    opt.value = `${p.nome} - ${p.curso}`;
    opt.textContent = p.nome;
    alunoSelect.appendChild(opt);
  });

  equipamentos?.forEach(eq => {
    if (eq.status === "No Armário") {
      const opt = document.createElement("option");
      opt.value = eq.nome;
      opt.textContent = eq.nome;
      equipSelect.appendChild(opt);
    }
  });
}

// ============================
// INICIALIZAÇÃO
// ============================
window.onload = function() {
  carregarPessoas();
  carregarEquipamentos();
  carregarEmprestimos();
};

// Tornar funções acessíveis no HTML
window.mostrarAba = mostrarAba;
window.registrarPessoa = registrarPessoa;
window.removerPessoa = removerPessoa;
window.registrarEquipamento = registrarEquipamento;
window.removerEquipamento = removerEquipamento;
window.registrarEmprestimo = registrarEmprestimo;
window.registrarDevolucao = registrarDevolucao;
